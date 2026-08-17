import { Hono } from "hono";
import sharp from "sharp";
import { db } from "../db";
import { media, mediaVariants } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { storeFile } from "../services/storage";
import { type ValidatedFile, validateFile } from "../services/validator";
import { generateVariants } from "../services/variants";

const MAX_DIMENSION = 1920;
const IMAGE_QUALITY = 95;

export const uploadRoutes = new Hono().post(
  "/",
  authMiddleware("ADMIN"),
  async (c) => {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    let validated: ValidatedFile;
    try {
      validated = await validateFile(file);
    } catch (e: unknown) {
      return c.json(
        { error: e instanceof Error ? e.message : "Upload failed" },
        400,
      );
    }

    const id = crypto.randomUUID();
    const ext = validated.mimeType.split("/")[1] || "bin";

    let finalBuffer = validated.buffer;
    let finalSize = validated.size;
    let originalWidth: number | null = null;
    let originalHeight: number | null = null;
    let processedWidth: number | null = null;
    let processedHeight: number | null = null;
    let storedName = `${id}.${ext}`;
    let storedMime = validated.mimeType;
    let blurDataUrl: string | null = null;

    if (validated.category === "image") {
      const image = sharp(validated.buffer, { failOn: "none" });

      let meta: sharp.Metadata | undefined;
      try {
        meta = await image.metadata();
      } catch {
        return c.json({ error: "Invalid image file" }, 400);
      }

      originalWidth = meta.width ?? null;
      originalHeight = meta.height ?? null;

      const pipeline = sharp(validated.buffer, { failOn: "none" })
        .rotate()
        .resize(MAX_DIMENSION, MAX_DIMENSION, {
          fit: "inside",
          withoutEnlargement: true,
        });

      try {
        finalBuffer = await pipeline
          .clone()
          .webp({ quality: IMAGE_QUALITY, effort: 6 })
          .toBuffer();
      } catch {
        return c.json({ error: "Failed to process image" }, 400);
      }

      finalSize = finalBuffer.byteLength;
      storedName = `${id}.webp`;
      storedMime = "image/webp";

      const finalMeta = await sharp(finalBuffer).metadata();
      processedWidth = finalMeta.width ?? null;
      processedHeight = finalMeta.height ?? null;

      try {
        const lqipBuf = await pipeline
          .clone()
          .resize(20)
          .webp({ quality: 40 })
          .toBuffer();
        blurDataUrl = `data:image/webp;base64,${lqipBuf.toString("base64")}`;
      } catch {
        blurDataUrl = null;
      }
    }

    const diskPath = storeFile(
      finalBuffer,
      id,
      storedMime.split("/")[1] || "bin",
    );

    await db.insert(media).values({
      id,
      originalName: file.name,
      storedName,
      mimeType: storedMime,
      fileSize: finalSize,
      width: processedWidth ?? undefined,
      height: processedHeight ?? undefined,
      originalWidth: originalWidth ?? undefined,
      originalHeight: originalHeight ?? undefined,
      blurDataUrl: blurDataUrl ?? undefined,
      diskPath,
    });

    if (validated.category === "image") {
      try {
        const variants = await generateVariants(id, finalBuffer);
        const results = await Promise.allSettled(
          variants.map((v) =>
            db.insert(mediaVariants).values({
              id: v.id,
              mediaId: v.mediaId,
              name: v.name,
              width: v.width,
              height: v.height ?? undefined,
              format: v.format,
              fileSize: v.fileSize,
              diskPath: v.diskPath,
            }),
          ),
        );
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          console.error(
            `[upload] ${failed.length} variant(s) failed for media ${id}`,
            failed,
          );
        }
      } catch (e) {
        console.error(`[upload] generateVariants failed for media ${id}`, e);
      }
    }

    const publicUrl =
      validated.category === "image"
        ? `/img/${id}/medium`
        : `/raw/${diskPath.replace("data/uploads/", "")}`;

    return c.json(
      {
        id,
        url: publicUrl,
        originalName: file.name,
        mimeType: storedMime,
        fileSize: finalSize,
        width: processedWidth,
        height: processedHeight,
        originalWidth,
        originalHeight,
        blurDataUrl,
      },
      201,
    );
  },
);
