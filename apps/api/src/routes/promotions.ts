import { zValidator } from "@hono/zod-validator";
import { and, asc, eq, gte, lte, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { promotions } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const CreatePromotionSchema = z.object({
  campaignName: z.string().min(1),
  discountPercentage: z.number().int().min(1).max(100),
  courseId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional().default(false),
});

const UpdatePromotionSchema = CreatePromotionSchema.partial();

async function checkConflictingActivePromotion(
  courseId: string | null | undefined,
  excludeId?: string,
): Promise<{ conflict: boolean; id?: string }> {
  const conditions: SQL[] = [eq(promotions.isActive, 1)];

  if (courseId) {
    conditions.push(eq(promotions.courseId, courseId));
  }

  const existing = await db
    .select()
    .from(promotions)
    .where(and(...conditions));

  for (const p of existing) {
    if (p.id !== excludeId) {
      return { conflict: true, id: p.id };
    }
  }

  return { conflict: false };
}

export const promotionRoutes = new Hono()
  .get("/active", async (c) => {
    const courseId = c.req.query("course_id");
    if (!courseId) {
      return c.json({ error: "course_id is required" }, 400);
    }

    const now = new Date().toISOString();

    const [promotion] = await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.courseId, courseId),
          eq(promotions.isActive, 1),
          gte(promotions.endDate!, now),
          lte(promotions.startDate!, now),
        ),
      )
      .orderBy(asc(promotions.endDate))
      .limit(1);

    if (!promotion) {
      return c.json(null);
    }

    return c.json(promotion);
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
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreatePromotionSchema),
    async (c) => {
      const data = c.req.valid("json");

      if (data.isActive && data.courseId) {
        const { conflict } = await checkConflictingActivePromotion(
          data.courseId,
        );
        if (conflict) {
          return c.json(
            { error: "An active promotion already exists for this course" },
            409,
          );
        }
      }

      const id = crypto.randomUUID();
      await db.insert(promotions).values({
        id,
        campaignName: data.campaignName,
        discountPercentage: data.discountPercentage,
        courseId: data.courseId ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        isActive: data.isActive ? 1 : 0,
      });

      const [created] = await db
        .select()
        .from(promotions)
        .where(eq(promotions.id, id));
      return c.json(created, 201);
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

      if (data.isActive !== undefined && data.isActive) {
        const targetCourseId = data.courseId ?? existing.courseId;
        if (targetCourseId) {
          const { conflict } = await checkConflictingActivePromotion(
            targetCourseId,
            id,
          );
          if (conflict) {
            return c.json(
              { error: "An active promotion already exists for this course" },
              409,
            );
          }
        }
      }

      const updates: Record<string, string | number | null> = {};
      if (data.campaignName !== undefined)
        updates.campaignName = data.campaignName;
      if (data.discountPercentage !== undefined)
        updates.discountPercentage = data.discountPercentage;
      if (data.courseId !== undefined) updates.courseId = data.courseId;
      if (data.startDate !== undefined) updates.startDate = data.startDate;
      if (data.endDate !== undefined) updates.endDate = data.endDate;
      if (data.isActive !== undefined) updates.isActive = data.isActive ? 1 : 0;

      await db.update(promotions).set(updates).where(eq(promotions.id, id));

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
