import { zValidator } from "@hono/zod-validator";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { faqs } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const CreateFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  courseId: z.string().optional(),
  sortOrder: z.number().int().optional().default(0),
});

const UpdateFaqSchema = CreateFaqSchema.partial();

const ReorderFaqSchema = z.object({
  ids: z.array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.number().int(),
    }),
  ),
});

export const faqRoutes = new Hono()
  .get("/", async (c) => {
    const courseId = c.req.query("course_id");

    let query = db.select().from(faqs).$dynamic();
    if (courseId) {
      query = query.where(eq(faqs.courseId, courseId));
    }
    query = query.orderBy(asc(faqs.sortOrder));

    const result = await query;
    return c.json(result);
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreateFaqSchema),
    async (c) => {
      const data = c.req.valid("json");
      const id = crypto.randomUUID();
      await db.insert(faqs).values({
        id,
        question: data.question,
        answer: data.answer,
        courseId: data.courseId ?? null,
        sortOrder: data.sortOrder ?? 0,
      });

      const [created] = await db.select().from(faqs).where(eq(faqs.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/reorder",
    authMiddleware("ADMIN"),
    zValidator("json", ReorderFaqSchema),
    async (c) => {
      const { ids } = c.req.valid("json");
      for (const item of ids) {
        await db
          .update(faqs)
          .set({ sortOrder: item.sortOrder })
          .where(eq(faqs.id, item.id));
      }
      return c.json({ success: true });
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdateFaqSchema),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [existing] = await db.select().from(faqs).where(eq(faqs.id, id));
      if (!existing) return c.json({ error: "Not found" }, 404);

      const updates: Record<string, string | null | number> = {};
      if (data.question !== undefined) updates.question = data.question;
      if (data.answer !== undefined) updates.answer = data.answer;
      if (data.courseId !== undefined) updates.courseId = data.courseId;
      if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;

      await db.update(faqs).set(updates).where(eq(faqs.id, id));

      const [updated] = await db.select().from(faqs).where(eq(faqs.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(faqs).where(eq(faqs.id, id));
    return c.json({ success: true });
  });

export type FaqRoutes = typeof faqRoutes;
