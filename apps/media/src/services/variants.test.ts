import { beforeAll, describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { existsSync, rmdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { generateVariants } from "../services/variants";

// Ensure DB is migrated
beforeAll(() => {
  execSync("bun run src/db/migrate.ts", { stdio: "pipe" });
});

describe("Variant Generator", () => {
  const testImageId = crypto.randomUUID();
  const VARIANTS_DIR = "data/variants";

  // Create a small test image (100x100 red square)
  async function createTestImageBuffer(): Promise<Uint8Array> {
    return await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();
  }

  test("generates all 5 variants", async () => {
    const buffer = await createTestImageBuffer();
    const results = await generateVariants(testImageId, buffer);

    expect(results.length).toBe(5);

    const names = results.map((r) => r.name).sort();
    expect(names).toEqual(["large", "medium", "micro", "og", "thumbnail"]);
  });

  test("variants have correct properties", async () => {
    const buffer = await createTestImageBuffer();
    const results = await generateVariants(testImageId, buffer);

    for (const v of results) {
      expect(v.mediaId).toBe(testImageId);
      expect(v.id).toBeTruthy();
      expect(v.width).toBeGreaterThan(0);
      expect(v.fileSize).toBeGreaterThan(0);
      expect(v.diskPath).toContain(testImageId);
    }
  });

  test("micro variant is 16px wide", async () => {
    const buffer = await createTestImageBuffer();
    const results = await generateVariants("micro-test", buffer);

    const micro = results.find((r) => r.name === "micro");
    expect(micro).toBeDefined();
    expect(micro?.width).toBe(16);
  });

  test("thumbnail variant respects withoutEnlargement", async () => {
    const buffer = await createTestImageBuffer();
    const results = await generateVariants("thumb-test", buffer);

    const thumb = results.find((r) => r.name === "thumbnail");
    expect(thumb).toBeDefined();
    // Source is 100px, thumbnail target is 400px, but withoutEnlargement keeps it at 100
    expect(thumb?.width).toBe(100);
    expect(thumb?.format).toBe("webp");
  });

  test("og variant is JPEG format", async () => {
    const buffer = await createTestImageBuffer();
    const results = await generateVariants("og-test", buffer);

    const og = results.find((r) => r.name === "og");
    expect(og).toBeDefined();
    expect(og?.format).toBe("jpeg");
    expect(og?.width).toBeLessThanOrEqual(1200);
  });

  test("variant files exist on disk", async () => {
    const buffer = await createTestImageBuffer();
    const id = "disk-test";
    const results = await generateVariants(id, buffer);

    for (const v of results) {
      expect(existsSync(v.diskPath)).toBe(true);
    }
  });

  test("withoutEnlargement does not upscale small images", async () => {
    const smallBuffer = await sharp({
      create: {
        width: 50,
        height: 50,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .png()
      .toBuffer();

    const results = await generateVariants("small-test", smallBuffer);

    const large = results.find((r) => r.name === "large");
    expect(large).toBeDefined();
    expect(large?.width).toBe(50); // Should stay at 50, not upscale to 1400
  });

  // Cleanup — skip on failure
  try {
    const dirs = [
      testImageId,
      "micro-test",
      "thumb-test",
      "og-test",
      "disk-test",
      "small-test",
    ];
    for (const dir of dirs) {
      const path = join(VARIANTS_DIR, dir);
      if (existsSync(path)) {
        try {
          require("node:fs")
            .readdirSync(path)
            .forEach((f: string) => unlinkSync(join(path, f)));
          rmdirSync(path);
        } catch {}
      }
    }
  } catch {}
});
