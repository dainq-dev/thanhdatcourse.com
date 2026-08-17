import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { courseLessons, courses, users } from "../db/schema";
import { app } from "../index";

describe("Lessons Routes", () => {
  let adminToken: string;
  let _userToken: string;
  let courseId: string;
  let moduleId: string;
  const testAdminEmail = "test-lessons-admin@example.com";
  const testUserEmail = "test-lessons-user@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testAdminEmail));
    await db.delete(users).where(eq(users.email, testUserEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db.insert(users).values({
      id: "lessons-admin-id",
      email: testAdminEmail,
      passwordHash: adminHash,
      name: "Lessons Admin",
      role: "ADMIN",
    });

    const adminRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testAdminEmail, password: "admin123" }),
    });
    adminToken = (await adminRes.json()).token;

    const userRes = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Lessons User",
        email: testUserEmail,
        password: "password123",
        confirmPassword: "password123",
      }),
    });
    _userToken = (await userRes.json()).token;

    const courseRes = await app.request("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Lessons Test Course With 10",
        description: "Test",
        basePrice: 500000,
      }),
    });
    courseId = (await courseRes.json()).id;

    const modRes = await app.request(`/api/courses/${courseId}/modules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ title: "Test Module", sortOrder: 0 }),
    });
    moduleId = (await modRes.json()).id;
  });

  afterAll(async () => {
    await db.delete(courses).where(eq(courses.id, courseId));
    await db.delete(users).where(eq(users.email, testAdminEmail));
    await db.delete(users).where(eq(users.email, testUserEmail));
  });

  describe("GET /api/modules/:moduleId/lessons", () => {
    test("returns empty array for module with no lessons", async () => {
      const res = await app.request(`/api/modules/${moduleId}/lessons`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });

  describe("POST /api/modules/:moduleId/lessons", () => {
    test("without auth returns 401", async () => {
      const res = await app.request(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Lesson 1" }),
      });
      expect(res.status).toBe(401);
    });

    test("with admin token creates lesson with defaults", async () => {
      const res = await app.request(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Bài 1: Giới thiệu",
          description: "Mô tả bài học",
          durationSeconds: 495,
          videoUrl: "https://youtube.com/watch?v=abc",
          isFreePreview: true,
        }),
      });
      expect(res.status).toBe(201);
      const lesson = await res.json();
      expect(lesson.id).toBeDefined();
      expect(lesson.title).toBe("Bài 1: Giới thiệu");
      expect(lesson.moduleId).toBe(moduleId);
      expect(lesson.isFreePreview).toBe(1);
      expect(lesson.type).toBe("video");
      expect(lesson.durationSeconds).toBe(495);
    });
  });

  describe("Lesson management", () => {
    let lessonId: string;
    let lessonId2: string;

    beforeAll(async () => {
      const r1 = await app.request(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title: "Lesson Alpha", sortOrder: 1 }),
      });
      lessonId = (await r1.json()).id;

      const r2 = await app.request(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Lesson Beta",
          sortOrder: 2,
          isFreePreview: false,
        }),
      });
      lessonId2 = (await r2.json()).id;
    });

    test("GET lessons returns ordered by sort_order", async () => {
      const res = await app.request(`/api/modules/${moduleId}/lessons`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBeGreaterThanOrEqual(3);
      for (let i = 1; i < data.length; i++) {
        expect(data[i].sortOrder).toBeGreaterThanOrEqual(data[i - 1].sortOrder);
      }
    });

    test("PUT toggles isFreePreview on lesson", async () => {
      const res = await app.request(
        `/api/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            isFreePreview: false,
            title: "Lesson Alpha Updated",
          }),
        },
      );
      expect(res.status).toBe(200);
      const lesson = await res.json();
      expect(lesson.isFreePreview).toBe(0);
      expect(lesson.title).toBe("Lesson Alpha Updated");
    });

    test("PUT updates lesson type and videoUrl", async () => {
      const res = await app.request(
        `/api/modules/${moduleId}/lessons/${lessonId2}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ type: "text", videoUrl: "" }),
        },
      );
      expect(res.status).toBe(200);
      const lesson = await res.json();
      expect(lesson.type).toBe("text");
    });

    test("DELETE removes lesson", async () => {
      const res = await app.request(
        `/api/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      expect(res.status).toBe(200);
      expect((await res.json()).success).toBe(true);

      const listRes = await app.request(`/api/modules/${moduleId}/lessons`);
      const list = await listRes.json();
      expect(
        list.find((l: { id: string }) => l.id === lessonId),
      ).toBeUndefined();
    });

    test("cascade: deleting module removes all its lessons", async () => {
      const tempModRes = await app.request(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title: "Temp Module", sortOrder: 99 }),
      });
      const tempModuleId = (await tempModRes.json()).id;

      const lessonRes = await app.request(
        `/api/modules/${tempModuleId}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ title: "Temp Lesson", sortOrder: 0 }),
        },
      );
      const tempLessonId = (await lessonRes.json()).id;

      await app.request(`/api/courses/${courseId}/modules/${tempModuleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const [check] = await db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.id, tempLessonId));
      expect(check).toBeUndefined();
    });
  });
});
