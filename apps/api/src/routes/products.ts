import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { digitalProducts } from "../db/schema";
import { authMiddleware, optionalAuth } from "../middleware/auth";

const ProductQuerySchema = z.object({
  published: z.coerce.boolean().optional(),
});

const CreateProductSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().positive(),
  thumbnailUrl: z.string().optional(),
  youtubePreviewId: z.string().optional(),
  externalCheckoutUrl: z.string().optional(),
  tag: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeaturedOnHome: z.boolean().optional(),
});

const UpdateProductSchema = CreateProductSchema.partial();

export const productRoutes = new Hono()
  .get(
    "/",
    optionalAuth(),
    zValidator("query", ProductQuerySchema),
    async (c) => {
      const { published } = c.req.valid("query");
      const isAdmin = c.get("user")?.role === "ADMIN";

      const conditions = [];
      if (published !== undefined && isAdmin) {
        conditions.push(eq(digitalProducts.isPublished, published ? 1 : 0));
      } else if (!isAdmin) {
        conditions.push(eq(digitalProducts.isPublished, 1));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const totalQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(digitalProducts)
        .$dynamic();
      if (where) totalQuery.where(where);
      const [totalRow] = await totalQuery;
      const total = Number(totalRow?.count);

      const resultQuery = db.select().from(digitalProducts).$dynamic();
      if (where) resultQuery.where(where);
      const result = await resultQuery.orderBy(desc(digitalProducts.createdAt));

      return c.json({ data: result, total });
    },
  )
  .get("/:id", optionalAuth(), async (c) => {
    const id = c.req.param("id");
    const isAdmin = c.get("user")?.role === "ADMIN";

    const conditions = [eq(digitalProducts.id, id)];
    if (!isAdmin) conditions.push(eq(digitalProducts.isPublished, 1));

    const [product] = await db
      .select()
      .from(digitalProducts)
      .where(and(...conditions));

    if (!product) return c.json({ error: "Not found" }, 404);

    return c.json(product);
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreateProductSchema),
    async (c) => {
      const data = c.req.valid("json");
      const id = crypto.randomUUID();

      await db.insert(digitalProducts).values({
        id,
        title: data.title,
        description: data.description ?? "",
        price: data.price,
        thumbnailUrl: data.thumbnailUrl,
        youtubePreviewId: data.youtubePreviewId,
        externalCheckoutUrl: data.externalCheckoutUrl,
        tag: data.tag,
        isPublished: data.isPublished ? 1 : 0,
        isFeaturedOnHome: data.isFeaturedOnHome ? 1 : 0,
      });

      const [created] = await db
        .select()
        .from(digitalProducts)
        .where(eq(digitalProducts.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdateProductSchema),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [product] = await db
        .select()
        .from(digitalProducts)
        .where(eq(digitalProducts.id, id));
      if (!product) return c.json({ error: "Not found" }, 404);

      const updates: Record<string, string | number | null> = {
        updatedAt: new Date().toISOString(),
      };
      if (data.title !== undefined) updates.title = data.title;
      if (data.description !== undefined)
        updates.description = data.description;
      if (data.price !== undefined) updates.price = data.price;
      if (data.thumbnailUrl !== undefined)
        updates.thumbnailUrl = data.thumbnailUrl;
      if (data.youtubePreviewId !== undefined)
        updates.youtubePreviewId = data.youtubePreviewId;
      if (data.externalCheckoutUrl !== undefined)
        updates.externalCheckoutUrl = data.externalCheckoutUrl;
      if (data.tag !== undefined) updates.tag = data.tag;
      if (data.isPublished !== undefined)
        updates.isPublished = data.isPublished ? 1 : 0;
      if (data.isFeaturedOnHome !== undefined)
        updates.isFeaturedOnHome = data.isFeaturedOnHome ? 1 : 0;

      await db
        .update(digitalProducts)
        .set(updates)
        .where(eq(digitalProducts.id, id));

      const [updated] = await db
        .select()
        .from(digitalProducts)
        .where(eq(digitalProducts.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(digitalProducts).where(eq(digitalProducts.id, id));
    return c.json({ success: true });
  });

export type ProductRoutes = typeof productRoutes;
