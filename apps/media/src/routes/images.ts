import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { and, eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import sharp from "sharp";
import type { VariantName } from "../config/variants";
import { IMAGE_VARIANTS } from "../config/variants";
import { db } from "../db";
import { media, mediaVariants } from "../db/schema";

const VARIANTS_DIR = "data/variants";

function notFound(c: Context) {
  return c.json({ error: "Media not found" }, 404);
}

function serveFile(c: Context, diskPath: string, mimeType: string) {
  const buf = readFileSync(diskPath);
  c.header("Content-Type", mimeType);
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  c.header("Content-Length", buf.byteLength.toString());
  return c.body(buf);
}

const ALLOWED_FORMATS = new Set(["webp", "jpeg", "avif", "png"]);
const MIN_WIDTH = 16;
const MAX_WIDTH = 3840;
const MIN_QUALITY = 10;
const MAX_QUALITY = 100;

export const imageRoutes = new Hono()
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const w = c.req.query("w");
    const format = c.req.query("f") || "webp";
    const quality = parseInt(c.req.query("q") || "82", 10);

    // Check if requested width for dynamic resize
    if (w) {
      const width = parseInt(w, 10);
      if (Number.isNaN(width) || width < MIN_WIDTH || width > MAX_WIDTH) {
        return c.json(
          { error: `Width must be between ${MIN_WIDTH} and ${MAX_WIDTH}` },
          400,
        );
      }
      if (!ALLOWED_FORMATS.has(format)) {
        return c.json({ error: `Unsupported format: ${format}` }, 400);
      }
      if (
        Number.isNaN(quality) ||
        quality < MIN_QUALITY ||
        quality > MAX_QUALITY
      ) {
        return c.json(
          {
            error: `Quality must be between ${MIN_QUALITY} and ${MAX_QUALITY}`,
          },
          400,
        );
      }
      return serveDynamicResize(c, id, width, format, quality);
    }

    // Serve medium variant by default
    return serveVariant(c, id, "medium");
  })
  .get("/:id/:variant", async (c) => {
    const id = c.req.param("id");
    const variant = c.req.param("variant");
    return serveVariant(c, id, variant as VariantName);
  });

async function serveVariant(c: Context, mediaId: string, name: string) {
  // Check DB for variant
  const [v] = await db
    .select()
    .from(mediaVariants)
    .where(
      and(eq(mediaVariants.mediaId, mediaId), eq(mediaVariants.name, name)),
    );

  if (!v) {
    // If variant not in DB, try dynamic generate from the "large" or source
    if (name in IMAGE_VARIANTS) {
      const config = IMAGE_VARIANTS[name as VariantName];
      return serveDynamicResize(
        c,
        mediaId,
        config.width,
        config.format,
        config.quality,
      );
    }
    return notFound(c);
  }

  if (!existsSync(v.diskPath)) {
    return notFound(c);
  }

  return serveFile(c, v.diskPath, `image/${v.format}`);
}

async function serveDynamicResize(
  c: Context,
  mediaId: string,
  width: number,
  format: string,
  quality: number,
) {
  // Check cache first
  const cacheKey = `dyn_${width}_${format}_q${quality}`;
  const [cached] = await db
    .select()
    .from(mediaVariants)
    .where(
      and(eq(mediaVariants.mediaId, mediaId), eq(mediaVariants.name, cacheKey)),
    );

  if (cached && existsSync(cached.diskPath)) {
    return serveFile(c, cached.diskPath, `image/${cached.format}`);
  }

  // Get source file
  const [mediaRecord] = await db
    .select()
    .from(media)
    .where(eq(media.id, mediaId));

  if (!mediaRecord || !existsSync(mediaRecord.diskPath)) {
    return notFound(c);
  }

  // Resize on the fly
  let pipeline = sharp(mediaRecord.diskPath)
    .rotate()
    .resize(width, undefined, { fit: "inside", withoutEnlargement: true });

  if (format === "webp") {
    pipeline = pipeline.webp({ quality, effort: 4 });
  } else if (format === "jpeg") {
    pipeline = pipeline.jpeg({ quality });
  } else if (format === "avif") {
    pipeline = pipeline.avif({ quality: Math.round(quality * 0.65) });
  } else if (format === "png") {
    pipeline = pipeline.png();
  }

  const buf = await pipeline.toBuffer();
  const meta = await sharp(buf).metadata();

  // Save to disk for future requests
  const dir = join(VARIANTS_DIR, mediaId);
  mkdirSync(dir, { recursive: true });
  const diskPath = join(dir, `${cacheKey}.${format}`);
  writeFileSync(diskPath, buf);

  // Save to DB
  await db
    .insert(mediaVariants)
    .values({
      id: crypto.randomUUID(),
      mediaId,
      name: cacheKey,
      width: meta.width ?? 0,
      height: meta.height ?? undefined,
      format,
      fileSize: buf.byteLength,
      diskPath,
    })
    .onConflictDoNothing();

  return serveFile(c, diskPath, `image/${format}`);
}
