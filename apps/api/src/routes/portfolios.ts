import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { portfolios } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const PortfolioQuerySchema = z.object({
  featured: z.coerce.boolean().optional(),
});

const CreatePortfolioSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  fullVideoUrl: z.string().optional(),
  youtubeVideoId: z.string().optional(),
  isFeaturedOnHome: z.boolean().optional(),
  featuredOrder: z.number().int().optional(),
});

const UpdatePortfolioSchema = CreatePortfolioSchema.partial();

export const portfolioRoutes = new Hono()
  .get("/", zValidator("query", PortfolioQuerySchema), async (c) => {
    const { featured } = c.req.valid("query");

    let query = db.select().from(portfolios).$dynamic();

    if (featured !== undefined) {
      query = query.where(eq(portfolios.isFeaturedOnHome, featured ? 1 : 0));
    }

    const result = await query.orderBy(desc(portfolios.createdAt));

    return c.json({ data: result });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, id));

    if (!portfolio) return c.json({ error: "Not found" }, 404);

    return c.json(portfolio);
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreatePortfolioSchema),
    async (c) => {
      const data = c.req.valid("json");
      const id = crypto.randomUUID();

      await db.insert(portfolios).values({
        id,
        title: data.title,
        description: data.description,
        category: data.category,
        thumbnailUrl: data.thumbnailUrl,
        fullVideoUrl: data.fullVideoUrl,
        youtubeVideoId: data.youtubeVideoId,
        isFeaturedOnHome: data.isFeaturedOnHome ? 1 : 0,
        featuredOrder: data.featuredOrder || 0,
      });

      const [created] = await db
        .select()
        .from(portfolios)
        .where(eq(portfolios.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdatePortfolioSchema),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [portfolio] = await db
        .select()
        .from(portfolios)
        .where(eq(portfolios.id, id));
      if (!portfolio) return c.json({ error: "Not found" }, 404);

      const updates: Record<string, string | number | null> = {};
      if (data.title !== undefined) updates.title = data.title;
      if (data.description !== undefined)
        updates.description = data.description;
      if (data.category !== undefined) updates.category = data.category;
      if (data.thumbnailUrl !== undefined)
        updates.thumbnailUrl = data.thumbnailUrl;
      if (data.fullVideoUrl !== undefined)
        updates.fullVideoUrl = data.fullVideoUrl;
      if (data.youtubeVideoId !== undefined)
        updates.youtubeVideoId = data.youtubeVideoId;
      if (data.isFeaturedOnHome !== undefined)
        updates.isFeaturedOnHome = data.isFeaturedOnHome ? 1 : 0;
      if (data.featuredOrder !== undefined)
        updates.featuredOrder = data.featuredOrder;

      await db.update(portfolios).set(updates).where(eq(portfolios.id, id));

      const [updated] = await db
        .select()
        .from(portfolios)
        .where(eq(portfolios.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(portfolios).where(eq(portfolios.id, id));
    return c.json({ success: true });
  });

export type PortfolioRoutes = typeof portfolioRoutes;
