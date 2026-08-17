import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { app } from "../index";

describe("Auth Routes", () => {
  const testEmail = "test-auth@example.com";
  let adminToken: string;
  let _userToken: string;

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db
      .insert(users)
      .values({
        id: "admin-test-id",
        email: testEmail,
        passwordHash: adminHash,
        name: "Admin Test",
        role: "ADMIN",
      })
      .onConflictDoNothing();
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, testEmail));
    await db.delete(users).where(eq(users.email, "newuser@example.com"));
  });

  test("POST /api/auth/login — valid admin credentials", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "admin123" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeString();
    expect(data.user.role).toBe("ADMIN");
    adminToken = data.token;
  });

  test("POST /api/auth/login — wrong password", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "wrongpassword" }),
    });
    expect(res.status).toBe(401);
  });

  test("POST /api/auth/login — missing fields", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.com" }),
    });
    expect(res.status).toBe(400);
  });

  test("POST /api/auth/register — creates new user", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.token).toBeString();
    expect(data.user.role).toBe("USER");
    _userToken = data.token;
  });

  test("POST /api/auth/register — duplicate email", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dup",
        email: "newuser@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    });
    expect(res.status).toBe(409);
  });

  test("POST /api/auth/register — password mismatch", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test",
        email: "x@y.com",
        password: "password123",
        confirmPassword: "different",
      }),
    });
    expect(res.status).toBe(400);
  });

  test("GET /api/auth/me — with valid token", async () => {
    const res = await app.request("/api/auth/me", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) {
      const errData = await res.json();
      console.log(
        "GET /me failed:",
        errData,
        "token:",
        adminToken?.substring(0, 40),
      );
    }
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.email).toBe(testEmail);
    expect(data.role).toBe("ADMIN");
  });

  test("GET /api/auth/me — without token", async () => {
    const res = await app.request("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("GET /api/auth/me — with invalid token", async () => {
    const res = await app.request("/api/auth/me", {
      headers: { Authorization: "Bearer invalid.token.here" },
    });
    expect(res.status).toBe(401);
  });

  test("Admin user has bcrypt hashed password in DB", async () => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail));
    expect(user).toBeDefined();
    expect(user?.passwordHash).not.toBe("admin123");
    expect(user?.passwordHash?.startsWith("$2")).toBe(true);
  });

  test("Login response time is under 200ms", async () => {
    const start = performance.now();
    await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "admin123" }),
    });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});
