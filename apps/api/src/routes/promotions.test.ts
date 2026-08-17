import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { promotions, users } from "../db/schema";
import { app } from "../index";

describe("Promotions Routes", () => {
  let adminToken: string;
  let courseId: string;
  let createdId: string;
  let createdId2: string;
  const testAdminEmail = "test-promotions-admin@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testAdminEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db.insert(users).values({
      id: "promotions-admin-id",
      email: testAdminEmail,
      passwordHash: adminHash,
      name: "Promotions Admin",
      role: "ADMIN",
    });

    const adminRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testAdminEmail, password: "admin123" }),
    });
    adminToken = (await adminRes.json()).token;

    // Get a seeded course
    const courseList = await app.request("/api/courses");
    const coursesData = (await courseList.json()).data;
    courseId = coursesData[0]?.id;
  });

  afterAll(async () => {
    if (createdId)
      await db.delete(promotions).where(eq(promotions.id, createdId));
    if (createdId2)
      await db.delete(promotions).where(eq(promotions.id, createdId2));
    await db.delete(users).where(eq(users.email, testAdminEmail));
  });

  test("POST / creates promotion (ADMIN)", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() - 1);
    const futureEnd = new Date();
    futureEnd.setFullYear(futureEnd.getFullYear() + 1);

    const res = await app.request("/api/promotions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        campaignName: "Test Promotion",
        discountPercentage: 20,
        courseId,
        startDate: futureDate.toISOString(),
        endDate: futureEnd.toISOString(),
        isActive: true,
      }),
    });
    expect(res.status).toBe(201);
    const p = await res.json();
    expect(p.id).toBeDefined();
    expect(p.campaignName).toBe("Test Promotion");
    expect(p.discountPercentage).toBe(20);
    expect(p.isActive).toBe(1);
    createdId = p.id;
  });

  test("GET /active returns active promotion for course", async () => {
    const res = await app.request(
      `/api/promotions/active?course_id=${courseId}`,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toBeDefined();
    expect(body.id).toBe(createdId);
    expect(body.isActive).toBe(1);
  });

  test("GET /active returns null with nonexistent course_id", async () => {
    const res = await app.request(
      "/api/promotions/active?course_id=nonexistent-id",
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  test("POST duplicate active for same course returns 409", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureEnd = new Date();
    futureEnd.setFullYear(futureEnd.getFullYear() + 1);

    const res = await app.request("/api/promotions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        campaignName: "Duplicate Promo",
        discountPercentage: 15,
        courseId,
        startDate: futureDate.toISOString(),
        endDate: futureEnd.toISOString(),
        isActive: true,
      }),
    });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("already exists");
  });

  test("GET /active respects dates — expired promotion not returned", async () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 2);
    const pastEnd = new Date();
    pastEnd.setFullYear(pastEnd.getFullYear() - 1);

    const createRes = await app.request("/api/promotions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        campaignName: "Expired Promo",
        discountPercentage: 10,
        courseId,
        startDate: pastDate.toISOString(),
        endDate: pastEnd.toISOString(),
        isActive: true,
      }),
    });

    if (createRes.status === 201) {
      createdId2 = (await createRes.json()).id;
    }

    const res = await app.request(
      `/api/promotions/active?course_id=${courseId}`,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    // Should still return the non-expired promotion (createdId)
    expect(body.id).toBe(createdId);
    expect(body.campaignName).toBe("Test Promotion");
  });

  test("DELETE /:id deletes a promotion (ADMIN)", async () => {
    const res = await app.request(`/api/promotions/${createdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  describe("PATCH /:id/toggle", () => {
    let toggleId: string;

    beforeAll(async () => {
      const res = await app.request("/api/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          campaign_name: "Toggle Test",
          discount_percentage: 10,
          course_ids: [courseId],
          is_active: true,
        }),
      });
      toggleId = (await res.json()).id;
    });

    afterAll(async () => {
      if (toggleId)
        await db.delete(promotions).where(eq(promotions.id, toggleId));
    });

    test("toggle requires is_active boolean", async () => {
      const res = await app.request(`/api/promotions/${toggleId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    test("toggle deactivates promotion", async () => {
      const res = await app.request(`/api/promotions/${toggleId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ is_active: false }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.isActive).toBe(0);
    });
  });
});
