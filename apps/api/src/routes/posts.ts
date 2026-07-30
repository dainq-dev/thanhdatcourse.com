import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, like, sql, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { ContentSchema } from "@workspace/types";
import { db } from "../db";
import { posts } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

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

const PostQuerySchema = z.object({
  published: z.coerce.boolean().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

const contentBlocksSchema = z.string().optional().refine(
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
);

const CreatePostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().min(1),
  contentBlocks: contentBlocksSchema,
  categoryId: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  seoDescription: z.string().optional(),
  author: z.string().optional(),
  readTime: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

const UpdatePostSchema = CreatePostSchema.partial();

export const postsRoutes = new Hono()
  .get("/", zValidator("query", PostQuerySchema), async (c) => {
    const { published, category, search, page, limit } = c.req.valid("query");

    const conditions: SQL[] = [];
    const isAdminReq = c.req.header("Authorization")?.startsWith("Bearer ");

    if (published || !isAdminReq) {
      conditions.push(eq(posts.isPublished, 1));
    }
    if (category) {
      conditions.push(eq(posts.categoryId, category));
    }
    if (search) {
      conditions.push(like(posts.title, `%${search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .$dynamic();
    if (where) totalQuery.where(where);
    const [totalRow] = await totalQuery;
    const total = Number(totalRow?.count);

    let query = db.select().from(posts).$dynamic();
    if (where) query = query.where(where);
    const result = await query
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return c.json({
      data: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
  .get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    const conditions = [eq(posts.slug, slug)];
    const isAdminReq = c.req.header("Authorization")?.startsWith("Bearer ");
    if (!isAdminReq) {
      conditions.push(eq(posts.isPublished, 1));
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(and(...conditions));

    if (!post) return c.json({ error: "Not found" }, 404);

    return c.json(post);
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreatePostSchema),
    async (c) => {
      const data = c.req.valid("json");
      const slug = data.slug || slugify(data.title);

      const [existing] = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug));
      if (existing) {
        return c.json({ error: "Slug đã tồn tại", field: "slug" }, 409);
      }

      const id = crypto.randomUUID();
      await db.insert(posts).values({
        id,
        slug,
        title: data.title,
        excerpt: data.excerpt,
        contentBlocks: data.contentBlocks ?? null,
        categoryId: data.categoryId ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
        seoDescription: data.seoDescription ?? null,
        author: data.author ?? "minhtravel",
        readTime: data.readTime ?? 5,
        isPublished: data.isPublished ? 1 : 0,
        publishedAt: data.isPublished ? new Date().toISOString() : null,
      });

      const [created] = await db.select().from(posts).where(eq(posts.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdatePostSchema),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      if (!post) return c.json({ error: "Not found" }, 404);

      if (data.slug) {
        const [dup] = await db
          .select()
          .from(posts)
          .where(and(eq(posts.slug, data.slug), sql`${posts.id} != ${id}`));
        if (dup)
          return c.json({ error: "Slug đã tồn tại", field: "slug" }, 409);
      }

      const updates: Record<string, string | number | null> = {
        updatedAt: new Date().toISOString(),
      };
      if (data.title !== undefined) updates.title = data.title;
      if (data.slug !== undefined) updates.slug = data.slug;
      if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
      if (data.contentBlocks !== undefined)
        updates.contentBlocks = data.contentBlocks;
      if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
      if (data.thumbnailUrl !== undefined)
        updates.thumbnailUrl = data.thumbnailUrl;
      if (data.seoDescription !== undefined)
        updates.seoDescription = data.seoDescription;
      if (data.author !== undefined) updates.author = data.author;
      if (data.readTime !== undefined) updates.readTime = data.readTime;
      if (data.isPublished !== undefined) {
        updates.isPublished = data.isPublished ? 1 : 0;
        if (data.isPublished && !post.publishedAt) {
          updates.publishedAt = new Date().toISOString();
        }
      }

      await db.update(posts).set(updates).where(eq(posts.id, id));

      const [updated] = await db.select().from(posts).where(eq(posts.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(posts).where(eq(posts.id, id));
    return c.json({ success: true });
  });

export type PostsRoutes = typeof postsRoutes;
