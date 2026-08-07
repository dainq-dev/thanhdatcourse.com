import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { courseLessons, courseModules } from "../db/schema";
import { authMiddleware, optionalAuth } from "../middleware/auth";

const CreateLessonSchema = z.object({
  title: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  contentBlocks: z.string().optional(),
  durationSeconds: z.number().int().optional(),
  videoUrl: z.string().optional(),
  isFreePreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const UpdateLessonSchema = CreateLessonSchema.partial();

export const lessonRoutes = new Hono()
  .get("/", optionalAuth(), async (c) => {
    const moduleId = c.req.param("moduleId");
    const isAdmin = c.get("user")?.role === "ADMIN";

    const query = db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.moduleId, moduleId))
      .$dynamic();
    if (!isAdmin) {
      query.where(eq(courseLessons.isPublished, 1));
    }
    const lessons = await query.orderBy(courseLessons.sortOrder);

    return c.json(lessons);
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreateLessonSchema),
    async (c) => {
      const moduleId = c.req.param("moduleId");
      const data = c.req.valid("json");

      const [mod] = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.id, moduleId));
      if (!mod) return c.json({ error: "Module not found" }, 404);

      const id = crypto.randomUUID();
      await db.insert(courseLessons).values({
        id,
        moduleId,
        title: data.title,
        type: data.type ?? "video",
        description: data.description ?? null,
        contentBlocks: data.contentBlocks ?? null,
        durationSeconds: data.durationSeconds ?? null,
        videoUrl: data.videoUrl ?? null,
        isFreePreview: data.isFreePreview ? 1 : 0,
        isPublished: data.isPublished ? 1 : 0,
        sortOrder: data.sortOrder ?? 0,
      });

      const [created] = await db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdateLessonSchema),
    async (c) => {
      const moduleId = c.req.param("moduleId");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [lesson] = await db
        .select()
        .from(courseLessons)
        .where(and(eq(courseLessons.id, id), eq(courseLessons.moduleId, moduleId)));
      if (!lesson) return c.json({ error: "Not found" }, 404);

      const updates: Record<string, string | number | null> = {};
      if (data.title !== undefined) updates.title = data.title;
      if (data.type !== undefined) updates.type = data.type;
      if (data.description !== undefined)
        updates.description = data.description;
      if (data.contentBlocks !== undefined)
        updates.contentBlocks = data.contentBlocks;
      if (data.durationSeconds !== undefined)
        updates.durationSeconds = data.durationSeconds;
      if (data.videoUrl !== undefined) updates.videoUrl = data.videoUrl;
      if (data.isFreePreview !== undefined)
        updates.isFreePreview = data.isFreePreview ? 1 : 0;
      if (data.isPublished !== undefined)
        updates.isPublished = data.isPublished ? 1 : 0;
      if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;

      if (Object.keys(updates).length > 0) {
        await db
          .update(courseLessons)
          .set(updates)
          .where(eq(courseLessons.id, id));
      }

      const [updated] = await db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const moduleId = c.req.param("moduleId");
    const id = c.req.param("id");
    await db
      .delete(courseLessons)
      .where(and(eq(courseLessons.id, id), eq(courseLessons.moduleId, moduleId)));
    return c.json({ success: true });
  });

export type LessonRoutes = typeof lessonRoutes;
