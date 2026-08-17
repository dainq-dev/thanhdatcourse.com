import { zValidator } from "@hono/zod-validator";
import {
  ENTITY_SECTION_MAP,
  type SectionType,
  SectionTypeSchema,
  SINGLETON_SECTION_TYPES,
  validateSectionConfig,
} from "@workspace/types";
import { and, asc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { courses, digitalProducts, sections } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const MAX_SECTIONS = 30;

const SectionCreateSchema = z.object({
  section_type: SectionTypeSchema,
  title: z.string().optional(),
  config: z.union([z.string(), z.record(z.unknown())]),
});

const SectionUpdateSchema = z.object({
  title: z.string().optional(),
  config: z.union([z.string(), z.record(z.unknown())]).optional(),
  is_published: z.boolean().optional(),
});

const ReorderSchema = z.object({
  ordered_ids: z.array(z.string()).min(1),
});

function getEntityType(path: string): "course" | "product" | null {
  if (path.includes("/api/course/") || path.includes("/api/courses/"))
    return "course";
  if (path.includes("/api/product/")) return "product";
  return null;
}

async function checkEntityExists(
  entityType: "course" | "product",
  entityId: string,
): Promise<boolean> {
  if (entityType === "course") {
    const [row] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(
        sql`(${courses.id} = ${entityId} OR ${courses.slug} = ${entityId})`,
      );
    return !!row;
  }
  const [row] = await db
    .select({ id: digitalProducts.id })
    .from(digitalProducts)
    .where(eq(digitalProducts.id, entityId));
  return !!row;
}

async function resolveEntityId(
  entityType: "course" | "product",
  input: string,
): Promise<string | null> {
  if (entityType === "course") {
    const [row] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(sql`(${courses.id} = ${input} OR ${courses.slug} = ${input})`);
    return row?.id ?? null;
  }
  return input;
}

async function getMaxSortOrder(
  entityType: string,
  entityId: string,
): Promise<number> {
  const [row] = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${sections.sortOrder}), -1)` })
    .from(sections)
    .where(
      and(eq(sections.entityType, entityType), eq(sections.entityId, entityId)),
    );
  return row ? row.maxOrder : -1;
}

async function countSections(
  entityType: string,
  entityId: string,
): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sections)
    .where(
      and(eq(sections.entityType, entityType), eq(sections.entityId, entityId)),
    );
  return Number(row?.count ?? 0);
}

async function checkSingletonExists(
  entityType: string,
  entityId: string,
  sectionType: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: sections.id })
    .from(sections)
    .where(
      and(
        eq(sections.entityType, entityType),
        eq(sections.entityId, entityId),
        eq(sections.sectionType, sectionType),
      ),
    );
  return !!row;
}

export const sectionRoutes = new Hono()
  .use("*", async (c, next) => {
    const path = c.req.path;
    const entityType = getEntityType(path);
    if (!entityType) return c.json({ error: "Invalid entity type" }, 400);
    c.set("entityType", entityType);
    await next();
  })
  .use("/:entityId/*", async (c, next) => {
    const input = c.req.param("entityId");
    const entityType = c.get("entityType") as "course" | "product";
    const realId = await resolveEntityId(entityType, input);
    if (!realId) return c.json({ error: "Entity not found" }, 404);
    c.set("resolvedEntityId", realId);
    await next();
  })
  .get("/:entityId/sections", authMiddleware("ADMIN"), async (c) => {
    const entityId = c.get("resolvedEntityId");
    const entityType = c.get("entityType") as "course" | "product";

    const rows = await db
      .select()
      .from(sections)
      .where(
        and(
          eq(sections.entityType, entityType),
          eq(sections.entityId, entityId),
        ),
      )
      .orderBy(asc(sections.sortOrder));

    return c.json(rows);
  })
  .post(
    "/:entityId/sections",
    authMiddleware("ADMIN"),
    zValidator("json", SectionCreateSchema),
    async (c) => {
      const entityId = c.get("resolvedEntityId");
      const entityType = c.get("entityType") as "course" | "product";
      const body = c.req.valid("json");

      const allowedTypes = ENTITY_SECTION_MAP[entityType] as string[];
      if (!allowedTypes.includes(body.section_type)) {
        return c.json(
          {
            error: `"${body.section_type}" is not available for entity type "${entityType}"`,
          },
          400,
        );
      }

      if ((SINGLETON_SECTION_TYPES as string[]).includes(body.section_type)) {
        const dup = await checkSingletonExists(
          entityType,
          entityId,
          body.section_type,
        );
        if (dup) {
          return c.json(
            {
              error: `"${body.section_type}" can only appear once per entity`,
            },
            400,
          );
        }
      }

      const currentCount = await countSections(entityType, entityId);
      if (currentCount >= MAX_SECTIONS) {
        return c.json(
          { error: `Maximum ${MAX_SECTIONS} sections allowed` },
          400,
        );
      }

      let config: unknown = body.config;
      if (typeof config === "string") {
        try {
          config = JSON.parse(config);
        } catch {
          config = {};
        }
      }

      try {
        validateSectionConfig(body.section_type as SectionType, config);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid config";
        return c.json({ error: message }, 400);
      }

      const newOrder = (await getMaxSortOrder(entityType, entityId)) + 1;
      const id = crypto.randomUUID();

      await db.insert(sections).values({
        id,
        entityType,
        entityId,
        sectionType: body.section_type,
        title: body.title ?? null,
        config: JSON.stringify(config),
        sortOrder: newOrder,
        isPublished: 1,
      });

      const [created] = await db
        .select()
        .from(sections)
        .where(eq(sections.id, id));
      return c.json(created, 201);
    },
  )
  .put(
    "/:entityId/sections/:id",
    authMiddleware("ADMIN"),
    zValidator("json", SectionUpdateSchema),
    async (c) => {
      const entityId = c.get("resolvedEntityId");
      const sectionId = c.req.param("id");
      const entityType = c.get("entityType") as "course" | "product";
      const body = c.req.valid("json");

      const [existing] = await db
        .select()
        .from(sections)
        .where(
          and(
            eq(sections.id, sectionId),
            eq(sections.entityType, entityType),
            eq(sections.entityId, entityId),
          ),
        );

      if (!existing) {
        return c.json({ error: "Section not found for this entity" }, 404);
      }

      const updates: Record<string, string | number | null> = {
        updatedAt: new Date().toISOString(),
      };

      if (body.title !== undefined) updates.title = body.title;
      if (body.is_published !== undefined)
        updates.isPublished = body.is_published ? 1 : 0;

      if (body.config !== undefined) {
        let config: unknown = body.config;
        if (typeof config === "string") {
          try {
            config = JSON.parse(config);
          } catch {
            config = {};
          }
        }
        try {
          validateSectionConfig(existing.sectionType as SectionType, config);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Invalid config";
          return c.json({ error: message }, 400);
        }
        updates.config = JSON.stringify(config);
      }

      await db.update(sections).set(updates).where(eq(sections.id, sectionId));

      const [updated] = await db
        .select()
        .from(sections)
        .where(eq(sections.id, sectionId));
      return c.json(updated);
    },
  )
  .delete("/:entityId/sections/:id", authMiddleware("ADMIN"), async (c) => {
    const entityId = c.get("resolvedEntityId");
    const sectionId = c.req.param("id");
    const entityType = c.get("entityType") as "course" | "product";

    const [existing] = await db
      .select()
      .from(sections)
      .where(
        and(
          eq(sections.id, sectionId),
          eq(sections.entityType, entityType),
          eq(sections.entityId, entityId),
        ),
      );

    if (!existing) {
      return c.json({ error: "Section not found for this entity" }, 404);
    }

    await db.delete(sections).where(eq(sections.id, sectionId));
    return c.json({ success: true });
  })
  .post(
    "/:entityId/sections/reorder",
    authMiddleware("ADMIN"),
    zValidator("json", ReorderSchema),
    async (c) => {
      const entityId = c.get("resolvedEntityId");
      const entityType = c.get("entityType") as "course" | "product";
      const { ordered_ids } = c.req.valid("json");

      const existingRows = await db
        .select({ id: sections.id })
        .from(sections)
        .where(
          and(
            eq(sections.entityType, entityType),
            eq(sections.entityId, entityId),
          ),
        );

      const existingIds = new Set(existingRows.map((r) => r.id));

      if (ordered_ids.length !== existingIds.size) {
        return c.json({ error: "All section ids must be present" }, 400);
      }

      for (const id of ordered_ids) {
        if (!existingIds.has(id)) {
          return c.json(
            { error: `"${id}" does not belong to this entity` },
            400,
          );
        }
      }

      await db.transaction(async (tx) => {
        for (let i = 0; i < ordered_ids.length; i++) {
          await tx
            .update(sections)
            .set({ sortOrder: i, updatedAt: new Date().toISOString() })
            .where(eq(sections.id, ordered_ids[i]));
        }
      });

      return c.json({ success: true });
    },
  )
  .post(
    "/:entityId/sections/batch",
    authMiddleware("ADMIN"),
    zValidator(
      "json",
      z.object({
        sections: z.array(
          z.object({
            section_type: SectionTypeSchema,
            title: z.string().optional(),
            config: z.union([z.string(), z.record(z.unknown())]),
          }),
        ),
      }),
    ),
    async (c) => {
      const entityId = c.get("resolvedEntityId");
      const entityType = c.get("entityType") as "course" | "product";
      const { sections: payload } = c.req.valid("json");

      const allowedTypes = ENTITY_SECTION_MAP[entityType] as string[];
      const currentCount = await countSections(entityType, entityId);

      if (currentCount + payload.length > MAX_SECTIONS) {
        return c.json(
          {
            error: `Cannot add ${payload.length} sections: maximum ${MAX_SECTIONS} would be exceeded`,
          },
          400,
        );
      }

      for (const item of payload) {
        if (!allowedTypes.includes(item.section_type)) {
          return c.json(
            {
              error: `"${item.section_type}" is not available for entity type "${entityType}"`,
            },
            400,
          );
        }
      }

      // Check payload itself doesn't have duplicate singleton types
      const singletonTypesInPayload = payload
        .map((p) => p.section_type)
        .filter((t) => (SINGLETON_SECTION_TYPES as string[]).includes(t));
      if (
        new Set(singletonTypesInPayload).size !== singletonTypesInPayload.length
      ) {
        return c.json(
          { error: "Duplicate singleton section type in payload" },
          400,
        );
      }

      let nextOrder = 0;
      const created: (typeof sections.$inferSelect)[] = [];

      await db.transaction(async (tx) => {
        // Full replace: delete all existing sections for this entity first
        await tx
          .delete(sections)
          .where(
            and(
              eq(sections.entityType, entityType),
              eq(sections.entityId, entityId),
            ),
          );

        for (const item of payload) {
          let config: unknown = item.config;
          if (typeof config === "string") {
            try {
              config = JSON.parse(config);
            } catch {
              config = {};
            }
          }

          try {
            validateSectionConfig(item.section_type as SectionType, config);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Invalid config";
            throw new Error(`"${item.section_type}": ${msg}`);
          }

          const id = crypto.randomUUID();
          await tx.insert(sections).values({
            id,
            entityType,
            entityId,
            sectionType: item.section_type,
            title: item.title ?? null,
            config: JSON.stringify(config),
            sortOrder: nextOrder++,
            isPublished: 1,
          });

          const [row] = await tx
            .select()
            .from(sections)
            .where(eq(sections.id, id));
          if (row) created.push(row);
        }
      });

      return c.json({ sections: created }, 201);
    },
  );
