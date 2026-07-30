import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { courseLessons, courseModules, courses } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const CreateModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const UpdateModuleSchema = CreateModuleSchema.partial();

const ReorderSchema = z.array(
  z.object({
    id: z.string(),
    sortOrder: z.number().int(),
  }),
);

export const moduleRoutes = new Hono()
  .get("/", async (c) => {
    const courseId = c.req.param("courseId");

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));
    if (!course) return c.json({ error: "Not found" }, 404);

    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(courseModules.sortOrder);

    const curriculum = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await db
          .select()
          .from(courseLessons)
          .where(eq(courseLessons.moduleId, mod.id))
          .orderBy(courseLessons.sortOrder);
        return { ...mod, lessons };
      }),
    );

    return c.json(curriculum);
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreateModuleSchema),
    async (c) => {
      const courseId = c.req.param("courseId");
      const data = c.req.valid("json");

      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId));
      if (!course) return c.json({ error: "Course not found" }, 404);

      const id = crypto.randomUUID();
      await db.insert(courseModules).values({
        id,
        courseId,
        title: data.title,
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
      });

      const [created] = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/reorder",
    authMiddleware("ADMIN"),
    zValidator("json", ReorderSchema),
    async (c) => {
      const _courseId = c.req.param("courseId");
      const items = c.req.valid("json");

      for (const item of items) {
        await db
          .update(courseModules)
          .set({ sortOrder: item.sortOrder })
          .where(eq(courseModules.id, item.id));
      }

      return c.json({ success: true });
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdateModuleSchema),
    async (c) => {
      const _courseId = c.req.param("courseId");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [mod] = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.id, id));
      if (!mod) return c.json({ error: "Not found" }, 404);

      const updates: Record<string, string | number | null> = {};
      if (data.title !== undefined) updates.title = data.title;
      if (data.description !== undefined)
        updates.description = data.description;
      if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;

      if (Object.keys(updates).length > 0) {
        await db
          .update(courseModules)
          .set(updates)
          .where(eq(courseModules.id, id));
      }

      const [updated] = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(courseModules).where(eq(courseModules.id, id));
    return c.json({ success: true });
  });

export type ModuleRoutes = typeof moduleRoutes;
