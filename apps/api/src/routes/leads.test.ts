import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { leads, users } from "../db/schema";
import { app } from "../index";

async function submitLead(ip: string) {
  return app.request("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": ip,
    },
    body: JSON.stringify({
      customerName: "Rate Limit Test",
      customerPhone: "0123456789",
    }),
  });
}

describe("Leads Routes", () => {
  let adminToken: string;
  const adminEmail = "test-leads@example.com";
  const leadIds: string[] = [];

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, adminEmail));
    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db
      .insert(users)
      .values({
        id: "leads-admin-id",
        email: adminEmail,
        passwordHash: adminHash,
        name: "Leads Admin",
        role: "ADMIN",
      })
      .onConflictDoNothing();

    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: "admin123" }),
    });
    const data = await res.json();
    adminToken = data.token;
  });

  afterAll(async () => {
    for (const id of leadIds) {
      await db.delete(leads).where(eq(leads.id, id));
    }
    await db.delete(users).where(eq(users.email, adminEmail));
  });

  describe("POST /api/leads", () => {
    test("submit lead returns 201 with status='NEW'", async () => {
      const res = await app.request("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.0.0.1",
        },
        body: JSON.stringify({
          customerName: "Nguyen Van A",
          customerEmail: "nguyenvana@example.com",
          customerPhone: "0987654321",
          message: "I want to learn After Effects",
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.lead).toBeDefined();
      expect(data.lead.status).toBe("NEW");
      expect(data.lead.customerName).toBe("Nguyen Van A");
      expect(data.lead.customerPhone).toBe("0987654321");
      leadIds.push(data.lead.id);
    });

    test("missing customerName returns 400", async () => {
      const res = await app.request("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.0.0.2",
        },
        body: JSON.stringify({
          customerPhone: "0987654321",
        }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("customerName");
    });

    test("missing customerPhone returns 400", async () => {
      const res = await app.request("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.0.0.3",
        },
        body: JSON.stringify({
          customerName: "Nguyen Van B",
        }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("customerPhone");
    });
  });

  describe("POST /api/leads — Rate Limiting", () => {
    test("4th submission from same IP within 1 hour returns 429", async () => {
      const ip = "192.168.1.100";
      for (let i = 0; i < 3; i++) {
        const res = await submitLead(ip);
        expect(res.status).toBe(201);
        const data = await res.json();
        leadIds.push(data.lead.id);
      }

      const res = await submitLead(ip);
      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.error).toContain("Too many requests");
    });

    test("different IPs are not rate-limited together", async () => {
      const ip2 = "10.0.0.99";
      const res = await submitLead(ip2);
      expect(res.status).toBe(201);
      const data = await res.json();
      leadIds.push(data.lead.id);
    });
  });

  describe("GET /api/leads", () => {
    test("without auth returns 401", async () => {
      const res = await app.request("/api/leads");
      expect(res.status).toBe(401);
    });

    test("with admin token returns 200 and array", async () => {
      const res = await app.request("/api/leads", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.leads)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(1);
    });

    test("filter by status returns only matching status", async () => {
      const contactedRes = await app.request("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.0.0.4",
        },
        body: JSON.stringify({
          customerName: "Contacted Lead",
          customerPhone: "0123456789",
        }),
      });
      const contactedData = await contactedRes.json();
      leadIds.push(contactedData.lead.id);

      await app.request(`/api/leads/${contactedData.lead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "CONTACTED" }),
      });

      const res = await app.request("/api/leads?status=CONTACTED", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.leads.length).toBeGreaterThanOrEqual(1);
      for (const lead of data.leads) {
        expect(lead.status).toBe("CONTACTED");
      }
    });
  });

  describe("PUT /api/leads/:id", () => {
    test("update status returns 200 with new status", async () => {
      const createRes = await app.request("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.0.0.5",
        },
        body: JSON.stringify({
          customerName: "Update Test",
          customerPhone: "0987654321",
        }),
      });
      const createData = await createRes.json();
      leadIds.push(createData.lead.id);

      const res = await app.request(`/api/leads/${createData.lead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: "CONVERTED",
          adminNotes: "Converted via phone call",
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.lead.status).toBe("CONVERTED");
      expect(data.lead.adminNotes).toBe("Converted via phone call");
    });

    test("invalid status returns 400", async () => {
      const createRes = await app.request("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.0.0.6",
        },
        body: JSON.stringify({
          customerName: "Invalid Status Test",
          customerPhone: "0987654321",
        }),
      });
      const createData = await createRes.json();
      leadIds.push(createData.lead.id);

      const res = await app.request(`/api/leads/${createData.lead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "INVALID_STATUS" }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });
});
