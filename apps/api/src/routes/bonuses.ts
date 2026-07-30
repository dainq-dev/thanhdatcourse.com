import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { courseBonuses, courses } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const CreateBonusSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const bonusRoutes = new Hono()
  .get("/", async (c) => {
    const courseId = c.req.param("courseId");

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));
    if (!course) return c.json({ error: "Not found" }, 404);

    const bonuses = await db
      .select()
      .from(courseBonuses)
      .where(eq(courseBonuses.courseId, courseId))
      .orderBy(courseBonuses.sortOrder);

    return c.json(bonuses);
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreateBonusSchema),
    async (c) => {
      const courseId = c.req.param("courseId");
      const data = c.req.valid("json");

      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId));
      if (!course) return c.json({ error: "Course not found" }, 404);

      const id = crypto.randomUUID();
      await db.insert(courseBonuses).values({
        id,
        courseId,
        name: data.name,
        value: data.value,
        icon: data.icon ?? null,
        sortOrder: data.sortOrder ?? 0,
      });

      const [created] = await db
        .select()
        .from(courseBonuses)
        .where(eq(courseBonuses.id, id));
      return c.json(created, 201);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(courseBonuses).where(eq(courseBonuses.id, id));
    return c.json({ success: true });
  });

export type BonusRoutes = typeof bonusRoutes;
