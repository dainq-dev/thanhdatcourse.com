import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { courseModules, courses, users } from "../db/schema";
import app from "../index";

describe("Modules Routes", () => {
  let adminToken: string;
  let userToken: string;
  let courseId: string;
  const testAdminEmail = "test-modules-admin@example.com";
  const testUserEmail = "test-modules-user@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testAdminEmail));
    await db.delete(users).where(eq(users.email, testUserEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db.insert(users).values({
      id: "modules-admin-id",
      email: testAdminEmail,
      passwordHash: adminHash,
      name: "Modules Admin",
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
        name: "Modules User",
        email: testUserEmail,
        password: "password123",
        confirmPassword: "password123",
      }),
    });
    userToken = (await userRes.json()).token;

    const courseRes = await app.request("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Modules Test Course With 10",
        description: "Test course for modules",
        basePrice: 500000,
      }),
    });
    courseId = (await courseRes.json()).id;
  });

  afterAll(async () => {
    await db.delete(courses).where(eq(courses.id, courseId));
    await db.delete(users).where(eq(users.email, testAdminEmail));
    await db.delete(users).where(eq(users.email, testUserEmail));
  });

  describe("GET /api/courses/:courseId/modules", () => {
    test("returns 404 for non-existent course", async () => {
      const res = await app.request("/api/courses/non-existent-id/modules");
      expect(res.status).toBe(404);
    });

    test("returns empty array for course with no modules", async () => {
      const res = await app.request(`/api/courses/${courseId}/modules`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });

  describe("POST /api/courses/:courseId/modules", () => {
    test("without auth returns 401", async () => {
      const res = await app.request(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Module 1" }),
      });
      expect(res.status).toBe(401);
    });

    test("with user token returns 403", async () => {
      const res = await app.request(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ title: "Module 1" }),
      });
      expect(res.status).toBe(403);
    });

    test("with admin token creates module and returns 201", async () => {
      const res = await app.request(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Chương 1: Nhập Môn",
          description: "Giới thiệu tổng quan",
        }),
      });
      expect(res.status).toBe(201);
      const mod = await res.json();
      expect(mod.id).toBeDefined();
      expect(mod.title).toBe("Chương 1: Nhập Môn");
      expect(mod.courseId).toBe(courseId);
      expect(mod.sortOrder).toBe(0);
    });
  });

  describe("Module management", () => {
    let moduleId1: string;
    let moduleId2: string;

    beforeAll(async () => {
      const r1 = await app.request(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title: "Module A", sortOrder: 1 }),
      });
      moduleId1 = (await r1.json()).id;

      const r2 = await app.request(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title: "Module B", sortOrder: 2 }),
      });
      moduleId2 = (await r2.json()).id;
    });

    afterAll(async () => {
      if (moduleId1)
        await db.delete(courseModules).where(eq(courseModules.id, moduleId1));
      if (moduleId2)
        await db.delete(courseModules).where(eq(courseModules.id, moduleId2));
    });

    test("GET returns modules ordered by sort_order", async () => {
      const res = await app.request(`/api/courses/${courseId}/modules`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBeGreaterThanOrEqual(2);
      expect(data[0].title).toBe("Chương 1: Nhập Môn");
      for (let i = 1; i < data.length; i++) {
        expect(data[i].sortOrder).toBeGreaterThanOrEqual(data[i - 1].sortOrder);
      }
    });

    test("PUT updates module fields", async () => {
      const res = await app.request(
        `/api/courses/${courseId}/modules/${moduleId1}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            title: "Module A Updated",
            description: "Updated desc",
          }),
        },
      );
      expect(res.status).toBe(200);
      const mod = await res.json();
      expect(mod.title).toBe("Module A Updated");
      expect(mod.description).toBe("Updated desc");
    });

    test("PUT reorder updates sort orders", async () => {
      const res = await app.request(
        `/api/courses/${courseId}/modules/reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify([
            { id: moduleId1, sortOrder: 20 },
            { id: moduleId2, sortOrder: 10 },
          ]),
        },
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const modulesRes = await app.request(`/api/courses/${courseId}/modules`);
      const modules = await modulesRes.json();
      const m1 = modules.find((m: { id: string; sortOrder: number }) => m.id === moduleId1);
      const m2 = modules.find((m: { id: string; sortOrder: number }) => m.id === moduleId2);
      expect(m1.sortOrder).toBe(20);
      expect(m2.sortOrder).toBe(10);
    });

    test("GET response includes nested lessons", async () => {
      const lessonRes = await app.request(`/api/modules/${moduleId1}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title: "Bài học test", sortOrder: 0 }),
      });
      expect(lessonRes.status).toBe(201);

      const res = await app.request(`/api/courses/${courseId}/modules`);
      const data = await res.json();
      const mod = data.find((m: { id: string; sortOrder: number }) => m.id === moduleId1);
      expect(mod.lessons).toBeDefined();
      expect(Array.isArray(mod.lessons)).toBe(true);
      expect(mod.lessons.length).toBe(1);
    });

    test("DELETE removes module", async () => {
      const res = await app.request(
        `/api/courses/${courseId}/modules/${moduleId1}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      expect(res.status).toBe(200);
      expect((await res.json()).success).toBe(true);

      const listRes = await app.request(`/api/courses/${courseId}/modules`);
      const list = await listRes.json();
      expect(list.find((m: { id: string; sortOrder: number }) => m.id === moduleId1)).toBeUndefined();
    });
  });
});
