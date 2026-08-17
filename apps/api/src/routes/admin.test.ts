import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { app } from "../index";

describe("Admin Stats Routes", () => {
  let adminToken: string;
  const testEmail = "test-admin-stats@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testEmail));
    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db
      .insert(users)
      .values({
        id: "admin-stats-id",
        email: testEmail,
        passwordHash: adminHash,
        name: "Admin Stats",
        role: "ADMIN",
      })
      .onConflictDoNothing();

    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "admin123" }),
    });
    const data = await res.json();
    adminToken = data.token;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, testEmail));
  });

  describe("GET /api/admin/stats", () => {
    test("without auth returns 401", async () => {
      const res = await app.request("/api/admin/stats");
      expect(res.status).toBe(401);
    });

    test("with admin token returns stats object with correct structure", async () => {
      const res = await app.request("/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data).toHaveProperty("courses");
      expect(data).toHaveProperty("posts");
      expect(data).toHaveProperty("leads");
      expect(data).toHaveProperty("recentPosts");
      expect(data).toHaveProperty("recentLeads");
      expect(data).toHaveProperty("recentCourses");

      expect(data.courses).toHaveProperty("total");
      expect(data.courses).toHaveProperty("published");
      expect(data.posts).toHaveProperty("total");
      expect(data.posts).toHaveProperty("published");
      expect(data.leads).toHaveProperty("newToday");
    });

    test("courses.total >= 8 (from seed)", async () => {
      const res = await app.request("/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(data.courses.total).toBeGreaterThanOrEqual(8);
    });

    test("posts.total >= 6 (from seed)", async () => {
      const res = await app.request("/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(data.posts.total).toBeGreaterThanOrEqual(6);
    });

    test("recentPosts returns array with expected fields", async () => {
      const res = await app.request("/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(Array.isArray(data.recentPosts)).toBe(true);
      expect(data.recentPosts.length).toBeGreaterThanOrEqual(1);
      expect(data.recentPosts[0]).toHaveProperty("id");
      expect(data.recentPosts[0]).toHaveProperty("title");
    });

    test("recentCourses returns array with expected fields", async () => {
      const res = await app.request("/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(Array.isArray(data.recentCourses)).toBe(true);
      expect(data.recentCourses.length).toBeGreaterThanOrEqual(1);
      expect(data.recentCourses[0]).toHaveProperty("id");
      expect(data.recentCourses[0]).toHaveProperty("title");
    });

    test("recentLeads returns array (may be empty)", async () => {
      const res = await app.request("/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(Array.isArray(data.recentLeads)).toBe(true);
    });

    test("stats response time under 500ms", async () => {
      const start = performance.now();
      const res = await app.request("/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const elapsed = performance.now() - start;
      expect(res.status).toBe(200);
      expect(elapsed).toBeLessThan(500);
    });
  });
});
