import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { courses, users } from "../db/schema";
import app from "../index";

describe("Courses Routes", () => {
  let adminToken: string;
  let userToken: string;
  let createdCourseId: string;
  let createdCourseSlug: string;
  const testAdminEmail = "test-courses-admin@example.com";
  const testUserEmail = "test-courses-user@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testAdminEmail));
    await db.delete(users).where(eq(users.email, testUserEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db.insert(users).values({
      id: "courses-admin-id",
      email: testAdminEmail,
      passwordHash: adminHash,
      name: "Courses Admin",
      role: "ADMIN",
    });

    const adminRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testAdminEmail, password: "admin123" }),
    });
    const adminData = await adminRes.json();
    adminToken = adminData.token;

    const userRes = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Courses User",
        email: testUserEmail,
        password: "password123",
        confirmPassword: "password123",
      }),
    });
    const userData = await userRes.json();
    userToken = userData.token;
  });

  afterAll(async () => {
    if (createdCourseSlug) {
      await db.delete(courses).where(eq(courses.slug, createdCourseSlug));
    }
    await db.delete(users).where(eq(users.email, testAdminEmail));
    await db.delete(users).where(eq(users.email, testUserEmail));
  });

  describe("POST /api/courses (Auth)", () => {
    test("without token returns 401", async () => {
      const res = await app.request("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Course Title At Least 10",
          description: "Test description",
          basePrice: 500000,
        }),
      });
      expect(res.status).toBe(401);
    });

    test("with user token returns 403", async () => {
      const res = await app.request("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          title: "Test Course Title At Least 10",
          description: "Test description",
          basePrice: 500000,
        }),
      });
      expect(res.status).toBe(403);
    });

    test("with admin token returns 201", async () => {
      const res = await app.request("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Test Course Title At Least 10",
          description: "Test description",
          basePrice: 500000,
        }),
      });
      expect(res.status).toBe(201);
      const course = await res.json();
      expect(course.id).toBeDefined();
      expect(course.title).toBe("Test Course Title At Least 10");
      expect(course.slug).toBe("test-course-title-at-least-10");
      createdCourseId = course.id;
      createdCourseSlug = course.slug;
    });
  });

  describe("POST /api/courses (Create)", () => {
    test("auto-generates slug from title", async () => {
      expect(createdCourseSlug).toBe("test-course-title-at-least-10");
    });

    test("rejects duplicate slug with 409", async () => {
      const res = await app.request("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Test Course Title At Least 10",
          slug: createdCourseSlug,
          description: "Test description",
          basePrice: 500000,
        }),
      });
      expect(res.status).toBe(409);
    });

    test("rejects title shorter than 10 chars with 400", async () => {
      const res = await app.request("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Short",
          description: "Test description",
          basePrice: 500000,
        }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/courses (List)", () => {
    test("returns array of courses without auth", async () => {
      const res = await app.request("/api/courses");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.pagination).toBeDefined();
    });

    test("published filter returns only is_published=1", async () => {
      const res = await app.request("/api/courses?published=true");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.length).toBeGreaterThan(0);
      for (const c of body.data) {
        expect(c.isPublished).toBe(1);
      }
    });

    test("search filter returns matching courses", async () => {
      const res = await app.request("/api/courses?search=TikTok");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.length).toBeGreaterThan(0);
      for (const c of body.data) {
        expect(c.title.toLowerCase()).toContain("tiktok");
      }
    });
  });

  describe("GET /api/courses/:slug (Get by slug)", () => {
    test("returns course data by slug", async () => {
      const res = await app.request(
        "/api/courses/30-ngay-sang-tao-video-trieu-view",
      );
      expect(res.status).toBe(200);
      const course = await res.json();
      expect(course.slug).toBe("30-ngay-sang-tao-video-trieu-view");
      expect(course.title).toBeDefined();
    });

    test("non-existent slug returns 404", async () => {
      const res = await app.request("/api/courses/non-existent-slug-12345");
      expect(res.status).toBe(404);
    });

    test("draft course returns 404 for public", async () => {
      const createRes = await app.request("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Draft Course Title Test Only Private",
          description: "A draft course that should not be visible",
          basePrice: 300000,
          isPublished: false,
        }),
      });
      const draft = await createRes.json();
      const draftSlug = draft.slug;

      const res = await app.request(`/api/courses/${draftSlug}`);
      expect(res.status).toBe(404);

      await db.delete(courses).where(eq(courses.slug, draftSlug));
    });
  });

  describe("PUT /api/courses/:id (Update)", () => {
    test("updates course fields", async () => {
      const res = await app.request(`/api/courses/${createdCourseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Updated Test Course Title Now Longer",
          description: "Updated description",
        }),
      });
      expect(res.status).toBe(200);
      const course = await res.json();
      expect(course.title).toBe("Updated Test Course Title Now Longer");
      expect(course.description).toBe("Updated description");
    });

    test("rejects slug change to existing slug with 409", async () => {
      const res = await app.request(`/api/courses/${createdCourseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          slug: "30-ngay-sang-tao-video-trieu-view",
        }),
      });
      expect(res.status).toBe(409);
    });
  });

  describe("DELETE /api/courses/:id (Delete)", () => {
    test("deletes course and returns success", async () => {
      const res = await app.request(`/api/courses/${createdCourseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    test("deleted course not in list", async () => {
      const res = await app.request("/api/courses");
      const body = await res.json();
      const slugs = body.data.map((c: { slug: string }) => c.slug);
      expect(slugs).not.toContain(createdCourseSlug);
    });
  });

  describe("Performance", () => {
    test("list courses returns under 50ms", async () => {
      const start = performance.now();
      const res = await app.request("/api/courses?published=true");
      const elapsed = performance.now() - start;
      expect(res.status).toBe(200);
      expect(elapsed).toBeLessThan(50);
    });
  });
});
