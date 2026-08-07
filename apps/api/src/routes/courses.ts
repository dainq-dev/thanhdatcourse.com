import { zValidator } from "@hono/zod-validator";
import { ContentSchema } from "@workspace/types";
import { and, asc, desc, eq, like, type SQL, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { courseLessons, courseModules, courses, sections } from "../db/schema";
import { authMiddleware, optionalAuth } from "../middleware/auth";

const CourseQuerySchema = z.object({
  published: z.coerce.boolean().optional(),
  draft: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

const CreateCourseSchema = z.object({
  title: z.string().min(10, "Tiêu đề phải có ít nhất 10 ký tự"),
  slug: z.string().min(3).optional(),
  description: z.string().min(1),
  basePrice: z.number().int().positive(),
  thumbnailUrl: z.string().optional().nullable(),
  trailerVideoUrl: z.string().optional().nullable(),
  externalCheckoutUrl: z.string().optional().nullable(),
  level: z.enum(["beginner", "intermediate", "advanced", "all"]).optional(),
  buttonText: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  isFeaturedOnHome: z.boolean().optional(),
  isComboOnly: z.boolean().optional(),
  learningOutcomes: z.array(z.string()).optional(),
  contentBlocks: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = JSON.parse(val);
          const result = ContentSchema.safeParse(parsed);
          return result.success;
        } catch {
          return false;
        }
      },
      { message: "Invalid content blocks JSON" },
    ),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

export const coursesRoutes = new Hono()
  .get("/", optionalAuth(), zValidator("query", CourseQuerySchema), async (c) => {
    const { published, draft, featured, search, page, limit } = c.req.valid("query");

    const conditions: SQL[] = [];
    const isAdmin = c.get("user")?.role === "ADMIN";

    if (draft && isAdmin) {
      conditions.push(eq(courses.isPublished, 0));
    } else if (published !== undefined) {
      conditions.push(eq(courses.isPublished, published ? 1 : 0));
    } else if (!isAdmin) {
      conditions.push(eq(courses.isPublished, 1));
    }
    if (featured)
      conditions.push(eq(courses.isFeaturedOnHome, featured ? 1 : 0));
    if (search) conditions.push(like(courses.title, `%${search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .$dynamic();
    if (where) totalQuery.where(where);
    const [totalRow] = await totalQuery;
    const total = Number(totalRow?.count);

    let query = db.select().from(courses).$dynamic();
    if (where) query = query.where(where);
    const result = await query
      .orderBy(desc(courses.updatedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return c.json({
      data: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
  .get("/:slug", optionalAuth(), async (c) => {
    const slug = c.req.param("slug");
    const isAdmin = c.get("user")?.role === "ADMIN";

    const conditions = [eq(courses.slug, slug)];
    if (!isAdmin) conditions.push(eq(courses.isPublished, 1));

    const [course] = await db
      .select()
      .from(courses)
      .where(and(...conditions));

    if (!course) return c.json({ error: "Not found" }, 404);

    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, course.id))
      .orderBy(courseModules.sortOrder);

    const curriculum = await Promise.all(
      modules.map(async (mod) => {
        const lessonQuery = db
          .select()
          .from(courseLessons)
          .where(eq(courseLessons.moduleId, mod.id))
          .orderBy(courseLessons.sortOrder)
          .$dynamic();
        if (!isAdmin) {
          lessonQuery.where(eq(courseLessons.isPublished, 1));
        }
        const lessons = await lessonQuery;
        return { ...mod, lessons };
      }),
    );

    const sectionRows = await db
      .select()
      .from(sections)
      .where(
        and(eq(sections.entityType, "course"), eq(sections.entityId, course.id)),
      )
      .orderBy(asc(sections.sortOrder));

    const parsedSections = sectionRows
      .filter((s) => isAdmin || s.isPublished === 1)
      .map((s) => ({ ...s, config: JSON.parse(s.config) }));

    return c.json({ ...course, modules: curriculum, sections: parsedSections });
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreateCourseSchema),
    async (c) => {
      const data = c.req.valid("json");
      const slug = data.slug || slugify(data.title);

      const [existing] = await db
        .select()
        .from(courses)
        .where(eq(courses.slug, slug));
      if (existing) {
        return c.json({ error: "Slug đã tồn tại", field: "slug" }, 409);
      }

      const id = crypto.randomUUID();
      await db.insert(courses).values({
        id,
        slug,
        title: data.title,
        description: data.description,
        basePrice: data.basePrice,
        thumbnailUrl: data.thumbnailUrl,
        trailerVideoUrl: data.trailerVideoUrl,
        externalCheckoutUrl: data.externalCheckoutUrl,
        level: data.level,
        buttonText: data.buttonText,
        isPublished: data.isPublished ? 1 : 0,
        isFeaturedOnHome: data.isFeaturedOnHome ? 1 : 0,
        isComboOnly: data.isComboOnly ? 1 : 0,
        learningOutcomes: data.learningOutcomes
          ? JSON.stringify(data.learningOutcomes)
          : null,
        contentBlocks: data.contentBlocks ?? null,
      });

      const [created] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdateCourseSchema),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id));
      if (!course) return c.json({ error: "Not found" }, 404);

      if (data.slug) {
        const [dup] = await db
          .select()
          .from(courses)
          .where(and(eq(courses.slug, data.slug), sql`${courses.id} != ${id}`));
        if (dup)
          return c.json({ error: "Slug đã tồn tại", field: "slug" }, 409);
      }

      const updates: Record<string, string | number | null> = {
        updatedAt: new Date().toISOString(),
      };
      if (data.title !== undefined) updates.title = data.title;
      if (data.slug !== undefined) updates.slug = data.slug;
      if (data.description !== undefined)
        updates.description = data.description;
      if (data.basePrice !== undefined) updates.basePrice = data.basePrice;
      if (data.thumbnailUrl !== undefined)
        updates.thumbnailUrl = data.thumbnailUrl;
      if (data.trailerVideoUrl !== undefined)
        updates.trailerVideoUrl = data.trailerVideoUrl;
      if (data.externalCheckoutUrl !== undefined)
        updates.externalCheckoutUrl = data.externalCheckoutUrl;
      if (data.level !== undefined) updates.level = data.level;
      if (data.buttonText !== undefined) updates.buttonText = data.buttonText;
      if (data.isPublished !== undefined)
        updates.isPublished = data.isPublished ? 1 : 0;
      if (data.isFeaturedOnHome !== undefined)
        updates.isFeaturedOnHome = data.isFeaturedOnHome ? 1 : 0;
      if (data.isComboOnly !== undefined)
        updates.isComboOnly = data.isComboOnly ? 1 : 0;
      if (data.learningOutcomes !== undefined)
        updates.learningOutcomes = JSON.stringify(data.learningOutcomes);
      if (data.contentBlocks !== undefined)
        updates.contentBlocks = data.contentBlocks;

      await db.update(courses).set(updates).where(eq(courses.id, id));

      const [updated] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(courses).where(eq(courses.id, id));
    return c.json({ success: true });
  });

export type CoursesRoutes = typeof coursesRoutes;
