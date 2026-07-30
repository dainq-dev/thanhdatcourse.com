import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { digitalProducts, users } from "../db/schema";
import app from "../index";

describe("Products Routes", () => {
  let adminToken: string;
  const testEmail = "test-products@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testEmail));
    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db
      .insert(users)
      .values({
        id: "products-admin-id",
        email: testEmail,
        passwordHash: adminHash,
        name: "Products Admin",
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

  describe("GET /api/products", () => {
    test("public: returns only published products", async () => {
      const publishedId = crypto.randomUUID();
      const draftId = crypto.randomUUID();

      await db.insert(digitalProducts).values([
        {
          id: publishedId,
          title: "Published Product",
          description: "desc",
          price: 1000,
          isPublished: 1,
        },
        {
          id: draftId,
          title: "Draft Product",
          description: "desc",
          price: 500,
          isPublished: 0,
        },
      ]);

      const res = await app.request("/api/products");
      expect(res.status).toBe(200);
      const data = await res.json();
      const ids = data.data.map((p: { id: string }) => p.id);
      expect(ids).toContain(publishedId);
      expect(ids).not.toContain(draftId);

      await db
        .delete(digitalProducts)
        .where(eq(digitalProducts.id, publishedId));
      await db.delete(digitalProducts).where(eq(digitalProducts.id, draftId));
    });
  });

  describe("GET /api/products/:id", () => {
    test("returns 200 for published product", async () => {
      const id = crypto.randomUUID();
      await db.insert(digitalProducts).values({
        id,
        title: "Published Product",
        description: "desc",
        price: 1000,
        isPublished: 1,
      });

      const res = await app.request(`/api/products/${id}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(id);

      await db.delete(digitalProducts).where(eq(digitalProducts.id, id));
    });
  });

  describe("POST /api/products", () => {
    test("creates a product and returns 201", async () => {
      const res = await app.request("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "New Product",
          description: "A digital product",
          price: 199000,
          thumbnailUrl: "https://example.com/prod.jpg",
          externalCheckoutUrl: "https://checkout.example.com",
          tag: "hot",
          isPublished: true,
          isFeaturedOnHome: true,
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.title).toBe("New Product");
      expect(data.price).toBe(199000);

      await db.delete(digitalProducts).where(eq(digitalProducts.id, data.id));
    });
  });

  describe("GET /api/products/:id draft", () => {
    test("draft product hidden from public: returns 404", async () => {
      const id = crypto.randomUUID();
      await db.insert(digitalProducts).values({
        id,
        title: "Draft Product",
        description: "desc",
        price: 500,
        isPublished: 0,
      });

      const res = await app.request(`/api/products/${id}`);
      expect(res.status).toBe(404);

      await db.delete(digitalProducts).where(eq(digitalProducts.id, id));
    });
  });

  describe("DELETE /api/products/:id", () => {
    test("deletes a product and returns success", async () => {
      const id = crypto.randomUUID();
      await db.insert(digitalProducts).values({
        id,
        title: "To Delete",
        description: "desc",
        price: 1000,
      });

      const res = await app.request(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
