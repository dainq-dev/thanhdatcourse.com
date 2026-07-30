import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { siteSettings, users } from "../db/schema";
import app from "../index";

describe("Settings Routes", () => {
  let adminToken: string;
  let userToken: string;
  const testEmail = "test-settings@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testEmail));
    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db
      .insert(users)
      .values({
        id: "settings-admin-id",
        email: testEmail,
        passwordHash: adminHash,
        name: "Settings Admin",
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

    const userRes = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Settings User",
        email: "settingsuser@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    });
    const userData = await userRes.json();
    userToken = userData.token;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, testEmail));
    await db.delete(users).where(eq(users.email, "settingsuser@example.com"));
  });

  describe("GET /api/settings", () => {
    test("returns all settings", async () => {
      const res = await app.request("/api/settings");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(50);
    });

    test("has Cache-Control header with max-age=60", async () => {
      const res = await app.request("/api/settings");
      expect(res.headers.get("Cache-Control")).toContain("max-age=60");
    });

    test("each item has key, value, description fields", async () => {
      const res = await app.request("/api/settings");
      const data = await res.json();
      expect(data.length).toBeGreaterThan(0);
      const first = data[0];
      expect(first).toHaveProperty("key");
      expect(first).toHaveProperty("value");
      expect(first).toHaveProperty("description");
    });
  });

  describe("PUT /api/settings/batch", () => {
    test("without auth returns 401", async () => {
      const res = await app.request("/api/settings/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_key: "test_value" }),
      });
      expect(res.status).toBe(401);
    });

    test("with user token returns 403", async () => {
      const res = await app.request("/api/settings/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ test_key: "test_value" }),
      });
      expect(res.status).toBe(403);
    });

    test("with admin token updates keys and returns { updated, keys }", async () => {
      const res = await app.request("/api/settings/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          site_title: "Updated Title",
          theme_color: "#FF0000",
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.updated).toBe(2);
      expect(data.keys).toEqual(["site_title", "theme_color"]);
    });

    test("value actually changed in DB", async () => {
      const [row] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "site_title"));
      expect(row.value).toBe("Updated Title");
    });

    test("creates a new key (upsert behavior)", async () => {
      const res = await app.request("/api/settings/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ brand_new_test_key: "hello world" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.updated).toBe(1);
      expect(data.keys).toEqual(["brand_new_test_key"]);

      const [row] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "brand_new_test_key"));
      expect(row).toBeDefined();
      expect(row.value).toBe("hello world");

      await db
        .delete(siteSettings)
        .where(eq(siteSettings.key, "brand_new_test_key"));
    });

    test("empty batch returns { updated: 0, keys: [] }", async () => {
      const res = await app.request("/api/settings/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.updated).toBe(0);
      expect(data.keys).toEqual([]);
    });

    test("invalid JSON returns 400", async () => {
      const res = await app.request("/api/settings/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: "not json",
      });
      expect(res.status).toBe(400);
    });
  });
});
