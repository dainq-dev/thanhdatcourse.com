import { zValidator } from "@hono/zod-validator";
import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { courses, promotionCourses, promotions } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const CreatePromotionSchema = z
  .object({
    campaign_name: z.string().min(1),
    discount_percentage: z.number().int().min(1).max(100),
    discount_amount: z.number().int().positive().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    is_active: z.boolean().optional().default(true),
    course_ids: z.array(z.string()).min(1, "Phải gán ít nhất 1 khóa học"),
  })
  .refine(
    (data) => {
      if (data.end_date && new Date(data.end_date) <= new Date()) {
        return false;
      }
      return true;
    },
    { message: "end_date phải là ngày trong tương lai" },
  );

const UpdatePromotionSchema = z
  .object({
    campaign_name: z.string().min(1).optional(),
    discount_percentage: z.number().int().min(1).max(100).optional(),
    discount_amount: z.number().int().positive().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.end_date && new Date(data.end_date) <= new Date()) {
        return false;
      }
      return true;
    },
    { message: "end_date phải là ngày trong tương lai" },
  );

export async function getActivePromotion(courseId: string) {
  const now = new Date().toISOString();
  const promos = await db
    .select()
    .from(promotions)
    .innerJoin(promotionCourses, eq(promotions.id, promotionCourses.promotionId))
    .where(
      and(
        eq(promotionCourses.courseId, courseId),
        eq(promotions.isActive, 1),
        or(isNull(promotions.startDate), lte(promotions.startDate, now)),
        or(isNull(promotions.endDate), gte(promotions.endDate, now)),
      ),
    )
    .orderBy(desc(promotions.discountPercentage), desc(promotions.startDate));

  return promos[0]?.promotions ?? null;
}

async function assignCoursesToPromotion(
  promotionId: string,
  courseIds: string[],
): Promise<void> {
  await db
    .delete(promotionCourses)
    .where(eq(promotionCourses.promotionId, promotionId));

  if (courseIds.length > 0) {
    await db.insert(promotionCourses).values(
      courseIds.map((cid) => ({
        promotionId,
        courseId: cid,
      })),
    );
  }
}

export const promotionRoutes = new Hono()
  .get("/active", async (c) => {
    const courseId = c.req.query("course_id");
    if (!courseId) {
      return c.json({ error: "course_id is required" }, 400);
    }
    const promo = await getActivePromotion(courseId);
    return c.json(promo);
  })
  .get("/", authMiddleware("ADMIN"), async (c) => {
    const active = c.req.query("active");

    let query = db.select().from(promotions).$dynamic();
    if (active === "true" || active === "1") {
      query = query.where(eq(promotions.isActive, 1));
    }

    const result = await query.orderBy(asc(promotions.campaignName));
    return c.json(result);
  })
  .get("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");

    const [promotion] = await db
      .select()
      .from(promotions)
      .where(eq(promotions.id, id));
    if (!promotion) return c.json({ error: "Not found" }, 404);

    const courseRows = await db
      .select()
      .from(promotionCourses)
      .where(eq(promotionCourses.promotionId, id));

    return c.json({
      ...promotion,
      course_ids: courseRows.map((r) => r.courseId),
    });
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreatePromotionSchema),
    async (c) => {
      const data = c.req.valid("json");

      if (data.course_ids.length > 0) {
        const courseRows = await db
          .select({ id: courses.id })
          .from(courses)
          .where(
            and(
              ...data.course_ids.map((cid) => eq(courses.id, cid)),
            ),
          );
        if (courseRows.length !== data.course_ids.length) {
          return c.json(
            { error: "Một hoặc nhiều course_id không tồn tại" },
            400,
          );
        }
      }

      const id = crypto.randomUUID();
      await db.insert(promotions).values({
        id,
        campaignName: data.campaign_name,
        discountPercentage: data.discount_percentage,
        discountAmount: data.discount_amount ?? null,
        startDate: data.start_date ?? null,
        endDate: data.end_date ?? null,
        isActive: data.is_active ? 1 : 0,
      });

      if (data.course_ids.length > 0) {
        await db.insert(promotionCourses).values(
          data.course_ids.map((cid) => ({
            promotionId: id,
            courseId: cid,
          })),
        );
      }

      const courseRows = await db
        .select()
        .from(promotionCourses)
        .where(eq(promotionCourses.promotionId, id));

      const [created] = await db
        .select()
        .from(promotions)
        .where(eq(promotions.id, id));

      return c.json(
        { ...created, course_ids: courseRows.map((r) => r.courseId) },
        201,
      );
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdatePromotionSchema),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [existing] = await db
        .select()
        .from(promotions)
        .where(eq(promotions.id, id));
      if (!existing) return c.json({ error: "Not found" }, 404);

      const updates: Record<string, string | number | null> = {};
      if (data.campaign_name !== undefined)
        updates.campaignName = data.campaign_name;
      if (data.discount_percentage !== undefined)
        updates.discountPercentage = data.discount_percentage;
      if (data.discount_amount !== undefined)
        updates.discountAmount = data.discount_amount;
      if (data.start_date !== undefined)
        updates.startDate = data.start_date;
      if (data.end_date !== undefined) updates.endDate = data.end_date;
      if (data.is_active !== undefined)
        updates.isActive = data.is_active ? 1 : 0;

      await db.update(promotions).set(updates).where(eq(promotions.id, id));

      const [updated] = await db
        .select()
        .from(promotions)
        .where(eq(promotions.id, id));
      return c.json(updated);
    },
  )
  .put(
    "/:id/courses",
    authMiddleware("ADMIN"),
    zValidator(
      "json",
      z.object({
        course_ids: z.array(z.string()),
      }),
    ),
    async (c) => {
      const id = c.req.param("id");
      const { course_ids } = c.req.valid("json");

      const [promotion] = await db
        .select()
        .from(promotions)
        .where(eq(promotions.id, id));
      if (!promotion) return c.json({ error: "Not found" }, 404);

      if (course_ids.length > 0) {
        const courseRows = await db
          .select({ id: courses.id })
          .from(courses)
          .where(
            and(...course_ids.map((cid) => eq(courses.id, cid))),
          );
        if (courseRows.length !== course_ids.length) {
          return c.json(
            { error: "Một hoặc nhiều course_id không tồn tại" },
            400,
          );
        }
      }

      await assignCoursesToPromotion(id, course_ids);

      const courseRows = await db
        .select()
        .from(promotionCourses)
        .where(eq(promotionCourses.promotionId, id));

      return c.json({
        ...promotion,
        course_ids: courseRows.map((r) => r.courseId),
      });
    },
  )
  .patch(
    "/:id/toggle",
    authMiddleware("ADMIN"),
    zValidator(
      "json",
      z.object({
        is_active: z.boolean(),
      }),
    ),
    async (c) => {
      const id = c.req.param("id");
      const { is_active } = c.req.valid("json");

      const [existing] = await db
        .select()
        .from(promotions)
        .where(eq(promotions.id, id));
      if (!existing) return c.json({ error: "Not found" }, 404);

      await db
        .update(promotions)
        .set({ isActive: is_active ? 1 : 0 })
        .where(eq(promotions.id, id));

      const [updated] = await db
        .select()
        .from(promotions)
        .where(eq(promotions.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(promotions).where(eq(promotions.id, id));
    return c.json({ success: true });
  });

export type PromotionRoutes = typeof promotionRoutes;
