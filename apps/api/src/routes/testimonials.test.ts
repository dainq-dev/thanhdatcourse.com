import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { testimonials, users } from "../db/schema";
import app from "../index";

describe("Testimonials Routes", () => {
  let adminToken: string;
  let createdId: string;
  const testAdminEmail = "test-testimonials-admin@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testAdminEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db.insert(users).values({
      id: "testimonials-admin-id",
      email: testAdminEmail,
      passwordHash: adminHash,
      name: "Testimonials Admin",
      role: "ADMIN",
    });

    const adminRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testAdminEmail, password: "admin123" }),
    });
    adminToken = (await adminRes.json()).token;
  });

  afterAll(async () => {
    if (createdId) {
      await db.delete(testimonials).where(eq(testimonials.id, createdId));
    }
    await db.delete(users).where(eq(users.email, testAdminEmail));
  });

  test("GET / returns array of testimonials", async () => {
    const res = await app.request("/api/testimonials");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    for (const t of data) {
      expect(t.userName).toBeDefined();
      expect(t.content).toBeDefined();
    }
  });

  test("GET / with featured=true returns only featured", async () => {
    const res = await app.request("/api/testimonials?featured=true");
    expect(res.status).toBe(200);
    const data = await res.json();
    for (const t of data) {
      expect(t.isFeatured).toBe(1);
    }
  });

  test("POST / creates a testimonial (ADMIN)", async () => {
    const res = await app.request("/api/testimonials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userName: "Test User",
        userRole: "Tester",
        rating: 4,
        content: "Great course!",
        title: "Awesome",
      }),
    });
    expect(res.status).toBe(201);
    const t = await res.json();
    expect(t.id).toBeDefined();
    expect(t.userName).toBe("Test User");
    expect(t.rating).toBe(4);
    createdId = t.id;
  });

  test("PUT /:id updates a testimonial (ADMIN)", async () => {
    const res = await app.request(`/api/testimonials/${createdId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        content: "Updated content",
        rating: 5,
      }),
    });
    expect(res.status).toBe(200);
    const t = await res.json();
    expect(t.content).toBe("Updated content");
    expect(t.rating).toBe(5);
  });

  test("DELETE /:id deletes a testimonial (ADMIN)", async () => {
    const res = await app.request(`/api/testimonials/${createdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
