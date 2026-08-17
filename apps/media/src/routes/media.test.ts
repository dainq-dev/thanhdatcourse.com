import { beforeAll, describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { externalRoutes } from "./external";
import { mediaRoutes } from "./media";

const JWT_SECRET = "dev-secret-change-in-production";
const app = new Hono()
  .route("/api/media", mediaRoutes)
  .route("/external", externalRoutes);

let adminToken: string;

beforeAll(async () => {
  adminToken = await sign(
    {
      userId: "admin-test-id",
      email: "admin@minhtravel.vn",
      role: "ADMIN",
      exp: Math.floor(Date.now() / 1000) + 86400,
    },
    JWT_SECRET,
    "HS256",
  );
});

describe("Media CRUD", () => {
  test("GET /api/media — list", async () => {
    const res = await app.request("/api/media", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.meta).toBeDefined();
  });

  test("GET /api/media without auth — 401", async () => {
    const res = await app.request("/api/media");
    expect(res.status).toBe(401);
  });

  test("GET /api/media/:id — 404 for non-existent", async () => {
    const res = await app.request("/api/media/non-existent-id", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(404);
  });

  test("DELETE /api/media/bulk — deletes multiple (missing ids skipped)", async () => {
    const res = await app.request("/api/media/bulk", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ ids: ["non-existent-1", "non-existent-2"] }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.success).toBe(true);
  });

  test("DELETE /api/media/bulk without auth — 401", async () => {
    const res = await app.request("/api/media/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ["x"] }),
    });
    expect(res.status).toBe(401);
  });
});

describe("External Media", () => {
  test("POST /external — YouTube", async () => {
    const res = await app.request("/external", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        source: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        altText: "Test video",
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.source).toBe("youtube");
    expect(json.data.youtubeId).toBe("dQw4w9WgXcQ");
  });

  test("POST /external — invalid YouTube URL", async () => {
    const res = await app.request("/external", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ source: "youtube", url: "https://google.com" }),
    });
    expect(res.status).toBe(400);
  });

  test("POST /external — external URL", async () => {
    const res = await app.request("/external", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        source: "external_url",
        url: "https://example.com/image.jpg",
        altText: "External",
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.source).toBe("external_url");
  });

  test("POST /external without auth — 401", async () => {
    const res = await app.request("/external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "youtube",
        url: "https://youtube.com/watch?v=abc12345678",
      }),
    });
    expect(res.status).toBe(401);
  });
});
