import { zValidator } from "@hono/zod-validator";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { testimonials } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const CreateTestimonialSchema = z.object({
  userName: z.string().min(1),
  userRole: z.string().optional(),
  userAvatarUrl: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional().default(5),
  content: z.string().min(1),
  title: z.string().optional(),
  courseId: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

const UpdateTestimonialSchema = CreateTestimonialSchema.partial();

export const testimonialRoutes = new Hono()
  .get("/", async (c) => {
    const courseId = c.req.query("course_id");
    const featured = c.req.query("featured");

    let query = db.select().from(testimonials).$dynamic();
    if (courseId) {
      query = query.where(eq(testimonials.courseId, courseId));
    }
    if (featured === "true" || featured === "1") {
      query = query.where(eq(testimonials.isFeatured, 1));
    }
    query = query.orderBy(asc(testimonials.sortOrder));

    const result = await query;
    return c.json(result);
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreateTestimonialSchema),
    async (c) => {
      const data = c.req.valid("json");
      const id = crypto.randomUUID();
      await db.insert(testimonials).values({
        id,
        userName: data.userName,
        userRole: data.userRole ?? null,
        userAvatarUrl: data.userAvatarUrl ?? null,
        rating: data.rating ?? 5,
        content: data.content,
        title: data.title ?? null,
        courseId: data.courseId ?? null,
        isFeatured: data.isFeatured ? 1 : 0,
        sortOrder: data.sortOrder ?? 0,
      });

      const [created] = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdateTestimonialSchema),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [existing] = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.id, id));
      if (!existing) return c.json({ error: "Not found" }, 404);

      const updates: Record<string, string | number | null> = {};
      if (data.userName !== undefined) updates.userName = data.userName;
      if (data.userRole !== undefined) updates.userRole = data.userRole;
      if (data.userAvatarUrl !== undefined)
        updates.userAvatarUrl = data.userAvatarUrl;
      if (data.rating !== undefined) updates.rating = data.rating;
      if (data.content !== undefined) updates.content = data.content;
      if (data.title !== undefined) updates.title = data.title;
      if (data.courseId !== undefined) updates.courseId = data.courseId;
      if (data.isFeatured !== undefined)
        updates.isFeatured = data.isFeatured ? 1 : 0;
      if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;

      await db.update(testimonials).set(updates).where(eq(testimonials.id, id));

      const [updated] = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(testimonials).where(eq(testimonials.id, id));
    return c.json({ success: true });
  });

export type TestimonialRoutes = typeof testimonialRoutes;
