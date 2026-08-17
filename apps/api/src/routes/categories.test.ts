import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { postCategories, posts, users } from "../db/schema";
import { app } from "../index";

describe("Categories Routes", () => {
  let adminToken: string;
  const testAdminEmail = "test-categories-admin@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testAdminEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db.insert(users).values({
      id: "categories-admin-id",
      email: testAdminEmail,
      passwordHash: adminHash,
      name: "Categories Admin",
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
    await db.delete(users).where(eq(users.email, testAdminEmail));
  });

  describe("GET /api/categories", () => {
    test("returns array of categories", async () => {
      const res = await app.request("/api/categories");
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("POST /api/categories", () => {
    let catId: string;

    afterAll(async () => {
      if (catId)
        await db.delete(postCategories).where(eq(postCategories.id, catId));
    });

    test("without auth returns 401", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Hướng dẫn" }),
      });
      expect(res.status).toBe(401);
    });

    test("creates category and returns 201", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ name: "Hướng dẫn quay dựng" }),
      });
      expect(res.status).toBe(201);
      const cat = await res.json();
      expect(cat.id).toBeDefined();
      expect(cat.name).toBe("Hướng dẫn quay dựng");
      expect(cat.slug).toBe("huong-dan-quay-dung");
      catId = cat.id;
    });

    test("duplicate slug returns 409", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          slug: "huong-dan-quay-dung",
          name: "Duplicate",
        }),
      });
      expect(res.status).toBe(409);
    });

    test("auto-generates slug from name", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ name: "Thủ thuật Premiere Pro" }),
      });
      expect(res.status).toBe(201);
      const cat = await res.json();
      expect(cat.slug).toBe("thu-thuat-premiere-pro");
      await db.delete(postCategories).where(eq(postCategories.id, cat.id));
    });
  });

  describe("Category management", () => {
    let catId: string;

    beforeAll(async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ name: "Kỹ thuật quay phim" }),
      });
      catId = (await res.json()).id;
    });

    afterAll(async () => {
      if (catId)
        await db.delete(postCategories).where(eq(postCategories.id, catId));
    });

    test("PUT updates category", async () => {
      const res = await app.request(`/api/categories/${catId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ name: "Kỹ thuật quay phim nâng cao" }),
      });
      expect(res.status).toBe(200);
      const cat = await res.json();
      expect(cat.name).toBe("Kỹ thuật quay phim nâng cao");
    });

    test("DELETE category sets posts category_id to NULL", async () => {
      const postRes = await app.request("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Post with category for delete test",
          excerpt: "Testing cascade",
          categoryId: catId,
          isPublished: true,
        }),
      });
      const postId = (await postRes.json()).id;

      const delRes = await app.request(`/api/categories/${catId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(delRes.status).toBe(200);
      expect((await delRes.json()).success).toBe(true);

      const [post] = await db.select().from(posts).where(eq(posts.id, postId));
      expect(post).toBeDefined();
      expect(post?.categoryId).toBeNull();

      await db.delete(posts).where(eq(posts.id, postId));
    });
  });
});
