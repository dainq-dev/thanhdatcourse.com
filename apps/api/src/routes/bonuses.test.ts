import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { courses, users } from "../db/schema";
import app from "../index";

describe("Bonuses Routes", () => {
  let adminToken: string;
  let _userToken: string;
  let courseId: string;
  const testAdminEmail = "test-bonuses-admin@example.com";
  const testUserEmail = "test-bonuses-user@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testAdminEmail));
    await db.delete(users).where(eq(users.email, testUserEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db.insert(users).values({
      id: "bonuses-admin-id",
      email: testAdminEmail,
      passwordHash: adminHash,
      name: "Bonuses Admin",
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
        name: "Bonuses User",
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
        title: "Bonuses Test Course With 10",
        description: "Test",
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

  test("GET bonuses returns empty array initially", async () => {
    const res = await app.request(`/api/courses/${courseId}/bonuses`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  test("POST without auth returns 401", async () => {
    const res = await app.request(`/api/courses/${courseId}/bonuses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bonus cash", value: "1.000.000đ" }),
    });
    expect(res.status).toBe(401);
  });

  test("POST create bonus returns 201", async () => {
    const res = await app.request(`/api/courses/${courseId}/bonuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "Bộ preset màu",
        value: "3.200.000đ",
        icon: "🎨",
      }),
    });
    expect(res.status).toBe(201);
    const bonus = await res.json();
    expect(bonus.id).toBeDefined();
    expect(bonus.name).toBe("Bộ preset màu");
    expect(bonus.value).toBe("3.200.000đ");
    expect(bonus.icon).toBe("🎨");
    expect(bonus.courseId).toBe(courseId);

    const listRes = await app.request(`/api/courses/${courseId}/bonuses`);
    const list = await listRes.json();
    expect(list.length).toBe(1);
  });

  test("DELETE removes bonus", async () => {
    const createRes = await app.request(`/api/courses/${courseId}/bonuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: "Extra bonus", value: "500.000đ" }),
    });
    const bonusId = (await createRes.json()).id;

    const deleteRes = await app.request(
      `/api/courses/${courseId}/bonuses/${bonusId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    expect(deleteRes.status).toBe(200);
    expect((await deleteRes.json()).success).toBe(true);

    const listRes = await app.request(`/api/courses/${courseId}/bonuses`);
    const list = await listRes.json();
    expect(list.find((b: { id: string }) => b.id === bonusId)).toBeUndefined();
  });
});
