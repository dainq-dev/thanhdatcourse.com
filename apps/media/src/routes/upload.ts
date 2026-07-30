import { Hono } from "hono";
import sharp from "sharp";
import { db } from "../db";
import { media, mediaVariants } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { storeFile } from "../services/storage";
import { validateFile } from "../services/validator";
import { generateVariants } from "../services/variants";

export const uploadRoutes = new Hono().post(
  "/",
  authMiddleware("ADMIN"),
  async (c) => {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    let validated;
    try {
      validated = await validateFile(file);
    } catch (e: unknown) {
      return c.json({ error: e instanceof Error ? e.message : "Upload failed" }, 400);
    }

    const id = crypto.randomUUID();
    const ext = validated.mimeType.split("/")[1] || "bin";

    let diskPath: string;
    let finalBuffer = validated.buffer;
    let finalSize = validated.size;
    let width: number | null = null;
    let height: number | null = null;
    let storedName = `${id}.${ext}`;
    let storedMime = validated.mimeType;

    if (validated.category === "image") {
      const image = sharp(validated.buffer);

      let _meta;
      try {
        _meta = await image.metadata();
      } catch {
        return c.json({ error: "Invalid image file" }, 400);
      }

      const optimizedBuf = await image
        .rotate()
        .resize(2560, 2560, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      finalBuffer = optimizedBuf;
      finalSize = optimizedBuf.byteLength;
      storedName = `${id}.webp`;
      storedMime = "image/webp";

      // Get original dimensions from metadata
      const finalMeta = await sharp(finalBuffer).metadata();
      width = finalMeta.width ?? null;
      height = finalMeta.height ?? null;
    } else {
      width = null;
      height = null;
    }

    diskPath = storeFile(finalBuffer, id, storedMime.split("/")[1] || "bin");

    await db.insert(media).values({
      id,
      originalName: file.name,
      storedName,
      mimeType: storedMime,
      fileSize: finalSize,
      width: width ?? undefined,
      height: height ?? undefined,
      diskPath,
    });

    // Generate variants for images
    if (validated.category === "image") {
      const variants = await generateVariants(id, finalBuffer);
      for (const v of variants) {
        await db.insert(mediaVariants).values({
          id: v.id,
          mediaId: v.mediaId,
          name: v.name,
          width: v.width,
          height: v.height ?? undefined,
          format: v.format,
          fileSize: v.fileSize,
          diskPath: v.diskPath,
        });
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
        width,
        height,
      },
      201,
    );
  },
);
