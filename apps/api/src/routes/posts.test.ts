import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { posts, users } from "../db/schema";
import { app } from "../index";

describe("Posts Routes", () => {
  let adminToken: string;
  const testAdminEmail = "test-posts-admin@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testAdminEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db.insert(users).values({
      id: "posts-admin-id",
      email: testAdminEmail,
      passwordHash: adminHash,
      name: "Posts Admin",
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

  describe("GET /api/posts", () => {
    test("returns array with pagination", async () => {
      const res = await app.request("/api/posts");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toBeDefined();
    });

    test("public only returns published posts", async () => {
      const res = await app.request("/api/posts?published=true");
      expect(res.status).toBe(200);
      const body = await res.json();
      for (const p of body.data) {
        expect(p.isPublished).toBe(1);
      }
    });

    test("admin draft filter returns only draft posts", async () => {
      const res = await app.request("/api/posts?draft=true", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      for (const p of body.data) {
        expect(p.isPublished).toBe(0);
      }
    });
  });

  describe("POST /api/posts", () => {
    let postSlug: string;
    let postId: string;

    afterAll(async () => {
      if (postId) await db.delete(posts).where(eq(posts.id, postId));
    });

    test("without auth returns 401", async () => {
      const res = await app.request("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Post Title",
          excerpt: "Test excerpt",
        }),
      });
      expect(res.status).toBe(401);
    });

    test("creates post with auto-generated slug", async () => {
      const res = await app.request("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Bài viết hướng dẫn quay dựng video",
          excerpt: "Mô tả ngắn về bài viết",
        }),
      });
      expect(res.status).toBe(201);
      const post = await res.json();
      expect(post.id).toBeDefined();
      expect(post.title).toBe("Bài viết hướng dẫn quay dựng video");
      expect(post.slug).toBe("bai-viet-huong-dan-quay-dung-video");
      expect(post.isPublished).toBe(0);
      expect(post.author).toBe("minhtravel");
      expect(post.readTime).toBe(5);

      postSlug = post.slug;
      postId = post.id;
    });

    test("draft post returns 404 for public GET by slug", async () => {
      const res = await app.request(`/api/posts/${postSlug}`);
      expect(res.status).toBe(404);
    });
  });

  describe("Post management", () => {
    let postId: string;
    let postSlug: string;

    beforeAll(async () => {
      const res = await app.request("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Bài viết về chỉnh màu chuyên nghiệp",
          excerpt: "Học cách chỉnh màu",
          isPublished: true,
          seoDescription: "SEO description for the post",
        }),
      });
      const post = await res.json();
      postId = post.id;
      postSlug = post.slug;
    });

    afterAll(async () => {
      if (postId) await db.delete(posts).where(eq(posts.id, postId));
    });

    test("GET by slug returns published post", async () => {
      const res = await app.request(`/api/posts/${postSlug}`);
      expect(res.status).toBe(200);
      const post = await res.json();
      expect(post.slug).toBe(postSlug);
      expect(post.title).toBe("Bài viết về chỉnh màu chuyên nghiệp");
      expect(post.seoDescription).toBe("SEO description for the post");
    });

    test("PUT updates post fields", async () => {
      const res = await app.request(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "Bài viết đã cập nhật về chỉnh màu",
          excerpt: "Updated excerpt",
          readTime: 10,
        }),
      });
      expect(res.status).toBe(200);
      const post = await res.json();
      expect(post.title).toBe("Bài viết đã cập nhật về chỉnh màu");
      expect(post.excerpt).toBe("Updated excerpt");
      expect(post.readTime).toBe(10);
    });

    test("DELETE removes post", async () => {
      const res = await app.request(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      expect((await res.json()).success).toBe(true);

      const getRes = await app.request(`/api/posts/${postSlug}`);
      expect(getRes.status).toBe(404);
    });
  });
});
