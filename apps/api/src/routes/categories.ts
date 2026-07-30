import { zValidator } from "@hono/zod-validator";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { postCategories } from "../db/schema";
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

const CreateCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

const UpdateCategorySchema = CreateCategorySchema.partial();

export const categoryRoutes = new Hono()
  .get("/", async (c) => {
    const categories = await db.select().from(postCategories);
    return c.json(categories);
  })
  .post(
    "/",
    authMiddleware("ADMIN"),
    zValidator("json", CreateCategorySchema),
    async (c) => {
      const data = c.req.valid("json");
      const slug = data.slug || slugify(data.name);

      const [existing] = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.slug, slug));
      if (existing) {
        return c.json({ error: "Slug đã tồn tại", field: "slug" }, 409);
      }

      const id = crypto.randomUUID();
      await db.insert(postCategories).values({
        id,
        name: data.name,
        slug,
      });

      const [created] = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/:id",
    authMiddleware("ADMIN"),
    zValidator("json", UpdateCategorySchema),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [cat] = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.id, id));
      if (!cat) return c.json({ error: "Not found" }, 404);

      if (data.slug) {
        const [dup] = await db
          .select()
          .from(postCategories)
          .where(
            and(
              eq(postCategories.slug, data.slug),
              sql`${postCategories.id} != ${id}`,
            ),
          );
        if (dup)
          return c.json({ error: "Slug đã tồn tại", field: "slug" }, 409);
      }

      const updates: Record<string, string> = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.slug !== undefined) updates.slug = data.slug;

      if (Object.keys(updates).length > 0) {
        await db
          .update(postCategories)
          .set(updates)
          .where(eq(postCategories.id, id));
      }

      const [updated] = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.id, id));
      return c.json(updated);
    },
  )
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");
    await db.delete(postCategories).where(eq(postCategories.id, id));
    return c.json({ success: true });
  });

export type CategoryRoutes = typeof categoryRoutes;
