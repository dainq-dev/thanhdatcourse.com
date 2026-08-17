import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { portfolios, users } from "../db/schema";
import { app } from "../index";

describe("Portfolios Routes", () => {
  let adminToken: string;
  const testEmail = "test-portfolios@example.com";
  let createdId: string;

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testEmail));
    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db
      .insert(users)
      .values({
        id: "portfolios-admin-id",
        email: testEmail,
        passwordHash: adminHash,
        name: "Portfolios Admin",
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

  describe("GET /api/portfolios", () => {
    test("returns 200 and an array", async () => {
      const res = await app.request("/api/portfolios");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    test("featured query returns only isFeaturedOnHome=1 items", async () => {
      const featuredId = crypto.randomUUID();
      const normalId = crypto.randomUUID();

      await db.insert(portfolios).values([
        {
          id: featuredId,
          title: "Featured Portfolio",
          category: "video",
          isFeaturedOnHome: 1,
          featuredOrder: 1,
        },
        {
          id: normalId,
          title: "Normal Portfolio",
          category: "video",
          isFeaturedOnHome: 0,
        },
      ]);

      const res = await app.request("/api/portfolios?featured=true");
      expect(res.status).toBe(200);
      const data = await res.json();
      const ids = data.data.map((p: { id: string }) => p.id);
      expect(ids).toContain(featuredId);
      expect(ids).not.toContain(normalId);

      await db.delete(portfolios).where(eq(portfolios.id, featuredId));
      await db.delete(portfolios).where(eq(portfolios.id, normalId));
    });
  });

  describe("GET /api/portfolios/:id", () => {
    test("returns 200 for existing portfolio", async () => {
      const id = crypto.randomUUID();
      await db.insert(portfolios).values({
        id,
        title: "Get by ID Test",
        category: "photo",
      });

      const res = await app.request(`/api/portfolios/${id}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(id);
      expect(data.title).toBe("Get by ID Test");

      await db.delete(portfolios).where(eq(portfolios.id, id));
    });
  });

  describe("POST /api/portfolios", () => {
    test("creates a portfolio and returns 201", async () => {
      const res = await app.request("/api/portfolios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Created Portfolio",
          description: "A test portfolio",
          category: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
          youtubeVideoId: "abc123",
          isFeaturedOnHome: true,
          featuredOrder: 1,
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.title).toBe("Created Portfolio");
      expect(data.category).toBe("video");
      expect(data.isFeaturedOnHome).toBe(1);
      createdId = data.id;

      await db.delete(portfolios).where(eq(portfolios.id, createdId));
    });
  });

  describe("PUT /api/portfolios/:id", () => {
    test("updates a portfolio and returns 200", async () => {
      const id = crypto.randomUUID();
      await db.insert(portfolios).values({
        id,
        title: "Before Update",
        category: "video",
      });

      const res = await app.request(`/api/portfolios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title: "After Update" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe("After Update");

      await db.delete(portfolios).where(eq(portfolios.id, id));
    });
  });

  describe("DELETE /api/portfolios/:id", () => {
    test("deletes a portfolio and returns success", async () => {
      const id = crypto.randomUUID();
      await db.insert(portfolios).values({
        id,
        title: "To Delete",
        category: "video",
      });

      const res = await app.request(`/api/portfolios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
