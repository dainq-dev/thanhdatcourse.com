import { existsSync, readdirSync, rmdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { desc, eq, like, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { media, mediaVariants } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

export const mediaRoutes = new Hono()
  .get("/", authMiddleware("ADMIN"), async (c) => {
    const type = c.req.query("type");
    const search = c.req.query("search");
    const page = parseInt(c.req.query("page") || "1", 10);
    const limit = parseInt(c.req.query("limit") || "40", 10);
    const offset = (page - 1) * limit;

    let query = db.select().from(media).$dynamic();

    if (type === "image")
      query = query.where(sql`${media.mimeType} LIKE 'image/%'`);
    else if (type === "video")
      query = query.where(sql`${media.mimeType} LIKE 'video/%'`);
    else if (type === "youtube")
      query = query.where(eq(media.source, "youtube"));

    if (search) {
      query = query.where(
        or(
          like(media.originalName, `%${search}%`),
          like(media.altText, `%${search}%`),
        ),
      );
    }

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(media);
    const rows = await query
      .orderBy(desc(media.uploadedAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      data: rows,
      meta: { total: countRow?.count ?? 0, page, limit },
    });
  })
  .get("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    const [mediaRow] = await db.select().from(media).where(eq(media.id, id));
    if (!mediaRow) return c.json({ error: "Media not found" }, 404);

    const variants = await db
      .select()
      .from(mediaVariants)
      .where(eq(mediaVariants.mediaId, id));
    return c.json({ data: { ...mediaRow, variants } });
  })
  .patch("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    if (body.altText !== undefined) {
      await db
        .update(media)
        .set({ altText: body.altText })
        .where(eq(media.id, id));
    }
    const [row] = await db.select().from(media).where(eq(media.id, id));
    if (!row) return c.json({ error: "Media not found" }, 404);
    return c.json({ data: row });
  })
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    const [row] = await db.select().from(media).where(eq(media.id, id));
    if (!row) return c.json({ error: "Media not found" }, 404);

    // Delete variant files
    const variantsDir = join("data/variants", id);
    if (existsSync(variantsDir)) {
      try {
        readdirSync(variantsDir).forEach((f) =>
          unlinkSync(join(variantsDir, f)),
        );
        rmdirSync(variantsDir);
      } catch {}
    }

    // Delete original file
    if (row.diskPath && existsSync(row.diskPath)) {
      try {
        unlinkSync(row.diskPath);
      } catch {}
    }

    // DB cascade deletes variants
    await db.delete(media).where(eq(media.id, id));
    return c.json({ data: { success: true } });
  });
