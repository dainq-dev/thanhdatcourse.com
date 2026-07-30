import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { db } from "../db";
import { media } from "../db/schema";
import { uploadRoutes } from "./upload";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

const app = new Hono().route("/upload", uploadRoutes);

let adminToken: string;

function generateTestJPEG(): Uint8Array {
  // Minimal valid JPEG (1x1 pixel, gray)
  // JPEG header: FF D8 FF E0 ...
  const jpeg = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
    0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
    0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
    0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
    0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
    0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
    0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
    0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
    0x00, 0x00, 0x3f, 0x00, 0x37, 0x80, 0x44, 0x92, 0x22, 0x3b, 0x85, 0x56,
    0x60, 0x0b, 0x1e, 0x80, 0x7a, 0x9a, 0x3f, 0xff, 0xd9,
  ]);
  return jpeg;
}

function _generateRealImageJPEG(): Uint8Array {
  // A larger JPEG (10x10 red pixel) via sharp is better, but for tests
  // we use a simple valid JPEG that sharp can process
  return generateTestJPEG();
}

function _cleanupTestFiles() {
  const dirs = ["data/uploads"];
  for (const dir of dirs) {
    if (existsSync(dir)) {
      const walkDir = (d: string) => {
        const entries = readdirSync(d);
        for (const entry of entries) {
          const full = join(d, entry);
          if (statSync(full).isDirectory()) {
            walkDir(full);
          }
        }
      };
      try {
        walkDir(dir);
      } catch {}
    }
  }
}

beforeAll(async () => {
  // Generate admin JWT token directly using hono/jwt
  const now = Math.floor(Date.now() / 1000);
  adminToken = await sign(
    {
      userId: "admin-test-id",
      email: "admin@minhtravel.vn",
      role: "ADMIN",
      exp: now + 3600,
    },
    JWT_SECRET,
    "HS256",
  );
});

afterAll(async () => {
  // Cleanup test data from DB
  try {
    await db.delete(media);
  } catch {}
});

describe("POST /upload", () => {
  test("returns 401 without auth header", async () => {
    const formData = new FormData();
    formData.append(
      "file",
      new File(["test"], "test.jpg", { type: "image/jpeg" }),
    );

    const res = await app.request("/upload", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(401);
  });

  test("returns 401 with invalid token", async () => {
    const formData = new FormData();
    formData.append(
      "file",
      new File(["test"], "test.jpg", { type: "image/jpeg" }),
    );

    const res = await app.request("/upload", {
      method: "POST",
      headers: { Authorization: "Bearer invalid.token.here" },
      body: formData,
    });
    expect(res.status).toBe(401);
  });

  test("returns 401 with non-admin token", async () => {
    const userToken = await sign(
      {
        userId: "user-id",
        email: "user@test.com",
        role: "USER",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      JWT_SECRET,
      "HS256",
    );

    const formData = new FormData();
    formData.append(
      "file",
      new File(["test"], "test.jpg", { type: "image/jpeg" }),
    );

    const res = await app.request("/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${userToken}` },
      body: formData,
    });
    expect(res.status).toBe(403);
  });

  test("returns 400 when no file is provided", async () => {
    const formData = new FormData();

    const res = await app.request("/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("No file");
  });

  test("returns 400 for invalid file type (text file with .jpg name)", async () => {
    const formData = new FormData();
    formData.append(
      "file",
      new File(["this is text content"], "fake.jpg", { type: "image/jpeg" }),
    );

    const res = await app.request("/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(400);
  });

  test("returns 400 for oversized file", async () => {
    // Create a valid JPEG header but with large size
    // Use a small valid JPEG header and report huge size via the File object
    // Since we check magic bytes first, the header must be valid
    // But the file size check uses file.size, so we can create a File with valid bytes
    // but tell the browser it's huge — however in tests, File.size comes from the array length.
    // We need to actually create a large buffer for this test.
    const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff]);
    const padding = new Uint8Array(51 * 1024 * 1024 - jpegHeader.length + 1);
    const oversized = new Uint8Array(jpegHeader.length + padding.length);
    oversized.set(jpegHeader);
    oversized.set(padding, jpegHeader.length);

    const formData = new FormData();
    formData.append(
      "file",
      new File([oversized], "big.jpg", { type: "image/jpeg" }),
    );

    const res = await app.request("/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("qu\u00e1 l\u1edbn");
  });

  test("successfully uploads a valid JPEG image", async () => {
    const jpegBytes = generateTestJPEG();
    const formData = new FormData();
    formData.append(
      "file",
      new File([jpegBytes], "test-photo.jpg", { type: "image/jpeg" }),
    );

    const res = await app.request("/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBeString();
    expect(data.id.length).toBe(36);
    expect(data.url).toMatch(/^\/img\/.+\/medium$/);
    expect(data.originalName).toBe("test-photo.jpg");
    expect(data.mimeType).toBe("image/webp");
    expect(data.fileSize).toBeGreaterThan(0);
  });

  test("uploaded media exists in database", async () => {
    const jpegBytes = generateTestJPEG();
    const formData = new FormData();
    formData.append(
      "file",
      new File([jpegBytes], "db-test.jpg", { type: "image/jpeg" }),
    );

    const res = await app.request("/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    const data = await res.json();

    const [record] = await db.select().from(media).where(eq(media.id, data.id));
    expect(record).not.toBeNull();
    expect(record?.originalName).toBe("db-test.jpg");
    expect(record?.mimeType).toBe("image/webp");
    expect(record?.storedName).toMatch(/\.webp$/);
    expect(record?.diskPath).toBeString();
    expect(record?.fileSize).toBeGreaterThan(0);
  });

  test("uploaded file exists on disk", async () => {
    const jpegBytes = generateTestJPEG();
    const formData = new FormData();
    formData.append(
      "file",
      new File([jpegBytes], "disk-test.jpg", { type: "image/jpeg" }),
    );

    const res = await app.request("/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    const data = await res.json();

    const [record] = await db.select().from(media).where(eq(media.id, data.id));
    expect(record).not.toBeNull();
    expect(existsSync(record?.diskPath)).toBe(true);
  });

  test("returns 400 for corrupted JPEG that sharp cannot process", async () => {
    // Valid JPEG magic bytes but broken data inside
    const brokenJPEG = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x00, 0x00]);
    const formData = new FormData();
    formData.append(
      "file",
      new File([brokenJPEG], "broken.jpg", { type: "image/jpeg" }),
    );

    const res = await app.request("/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid image");
  });
});
