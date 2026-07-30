import { beforeAll, describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Hono } from "hono";
import sharp from "sharp";
import { imageRoutes } from "./images";

// Ensure DB and tables exist
beforeAll(() => {
  execSync("bun run src/db/migrate.ts", { stdio: "pipe" });
});

const app = new Hono().route("/img", imageRoutes);

async function _uploadTestImage(): Promise<{ id: string }> {
  const buf = await sharp({
    create: {
      width: 200,
      height: 200,
      channels: 3,
      background: { r: 0, g: 100, b: 200 },
    },
  })
    .jpeg({ quality: 90 })
    .toBuffer();

  const formData = new FormData();
  formData.append("file", new File([buf], "test.jpg", { type: "image/jpeg" }));
  formData.append("altText", "test");

  // Login first
  const loginRes = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@minhtravel.vn",
      password: "admin123",
    }),
  });
  const { token } = await loginRes.json();

  const res = await fetch("http://localhost:3001/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}

describe("Image Serving Routes", () => {
  test("GET /img/nonexistent returns 404", async () => {
    const res = await app.request("/img/nonexistent-id");
    expect(res.status).toBe(404);
  });

  test("GET /img/:id/variant returns 404 for non-existent variant", async () => {
    // Use a random ID that doesn't exist
    const res = await app.request("/img/random-abc/thumbnail");
    expect(res.status).toBe(404);
  });

  test("GET /img with ?w= param returns image", async () => {
    const buf = await sharp({
      create: {
        width: 300,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();

    const id = crypto.randomUUID();
    const dir = join(
      "data/uploads",
      new Date().getFullYear().toString(),
      (new Date().getMonth() + 1).toString().padStart(2, "0"),
    );
    mkdirSync(dir, { recursive: true });
    const diskPath = join(dir, `${id}.webp`);

    const optimized = await sharp(buf)
      .resize(800, 800, { fit: "inside" })
      .webp({ quality: 82 })
      .toBuffer();
    writeFileSync(diskPath, optimized);

    // Insert into DB
    const { db } = await import("../db");
    const { media } = await import("../db/schema");
    await db.insert(media).values({
      id,
      originalName: "test.jpg",
      storedName: `${id}.webp`,
      mimeType: "image/webp",
      fileSize: optimized.byteLength,
      width: 300,
      height: 200,
      diskPath,
    });

    const res = await app.request(`/img/${id}?w=150&f=webp&q=80`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/webp");
    expect(res.headers.get("Cache-Control")).toContain("max-age=31536000");

    const body = await res.arrayBuffer();
    expect(body.byteLength).toBeGreaterThan(0);

    const meta = await sharp(Buffer.from(body)).metadata();
    expect(meta.width).toBeLessThanOrEqual(150);
  });

  test("on-the-fly resize result is cached for second request", async () => {
    const buf = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 0, g: 200, b: 0 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();

    const id = crypto.randomUUID();
    const dir = join(
      "data/uploads",
      new Date().getFullYear().toString(),
      (new Date().getMonth() + 1).toString().padStart(2, "0"),
    );
    mkdirSync(dir, { recursive: true });
    const diskPath = join(dir, `${id}.webp`);

    const optimized = await sharp(buf)
      .resize(800, 800, { fit: "inside" })
      .webp({ quality: 82 })
      .toBuffer();
    writeFileSync(diskPath, optimized);

    const { db } = await import("../db");
    const { media } = await import("../db/schema");
    await db.insert(media).values({
      id,
      originalName: "test.jpg",
      storedName: `${id}.webp`,
      mimeType: "image/webp",
      fileSize: optimized.byteLength,
      width: 400,
      height: 300,
      diskPath,
    });

    // First request creates variant
    const res1 = await app.request(`/img/${id}?w=200&f=webp&q=80`);
    expect(res1.status).toBe(200);

    // Second request should return cached variant (faster)
    const start = performance.now();
    const res2 = await app.request(`/img/${id}?w=200&f=webp&q=80`);
    const elapsed = performance.now() - start;
    expect(res2.status).toBe(200);
    expect(elapsed).toBeLessThan(50); // cached, should be very fast
  });
});
