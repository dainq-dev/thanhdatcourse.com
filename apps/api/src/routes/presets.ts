import { zValidator } from "@hono/zod-validator";
import {
  ENTITY_SECTION_MAP,
  SectionTypeSchema,
  SINGLETON_SECTION_TYPES,
  validateSectionConfig,
  type SectionType,
} from "@workspace/types";
import { and, asc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { sections } from "../db/schema";
import { authMiddleware, optionalAuth } from "../middleware/auth";

const MAX_SECTIONS = 30;

export const presetsRoutes = new Hono()
  .get("/", optionalAuth(), async (c) => {
    const isAdmin = c.get("user")?.role === "ADMIN";

    const rows = await db
      .select()
      .from(sections)
      .where(
        and(
          eq(sections.entityType, "presets_page"),
          eq(sections.entityId, "singleton"),
        ),
      )
      .orderBy(asc(sections.sortOrder));

    const filtered = isAdmin
      ? rows
      : rows.filter((r) => r.isPublished === 1);

    return c.json({ sections: filtered });
  })
  .post(
    "/sections",
    authMiddleware("ADMIN"),
    zValidator(
      "json",
      z.object({
        section_type: SectionTypeSchema,
        title: z.string().optional(),
        config: z.union([z.string(), z.record(z.unknown())]),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");

      const allowedTypes = ENTITY_SECTION_MAP.presets_page as string[];
      if (!allowedTypes.includes(body.section_type)) {
        return c.json(
          {
            error: `"${body.section_type}" is not available for presets_page`,
          },
          400,
        );
      }

      if (
        (SINGLETON_SECTION_TYPES as string[]).includes(body.section_type)
      ) {
        const [dup] = await db
          .select({ id: sections.id })
          .from(sections)
          .where(
            and(
              eq(sections.entityType, "presets_page"),
              eq(sections.entityId, "singleton"),
              eq(sections.sectionType, body.section_type),
            ),
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

      const [countRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sections)
        .where(
          and(
            eq(sections.entityType, "presets_page"),
            eq(sections.entityId, "singleton"),
          ),
        );
      if (Number(countRow?.count ?? 0) >= MAX_SECTIONS) {
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
        const message =
          err instanceof Error ? err.message : "Invalid config";
        return c.json({ error: message }, 400);
      }

      const [orderRow] = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${sections.sortOrder}), -1)` })
        .from(sections)
        .where(
          and(
            eq(sections.entityType, "presets_page"),
            eq(sections.entityId, "singleton"),
          ),
        );
      const newOrder = (orderRow?.maxOrder ?? -1) + 1;
      const id = crypto.randomUUID();

      await db.insert(sections).values({
        id,
        entityType: "presets_page",
        entityId: "singleton",
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
    "/sections/:id",
    authMiddleware("ADMIN"),
    zValidator(
      "json",
      z.object({
        title: z.string().optional(),
        config: z.union([z.string(), z.record(z.unknown())]).optional(),
        is_published: z.boolean().optional(),
      }),
    ),
    async (c) => {
      const sectionId = c.req.param("id");
      const body = c.req.valid("json");

      const [existing] = await db
        .select()
        .from(sections)
        .where(
          and(
            eq(sections.id, sectionId),
            eq(sections.entityType, "presets_page"),
            eq(sections.entityId, "singleton"),
          ),
        );

      if (!existing) {
        return c.json({ error: "Section not found" }, 404);
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
          const message =
            err instanceof Error ? err.message : "Invalid config";
          return c.json({ error: message }, 400);
        }
        updates.config = JSON.stringify(config);
      }

      await db
        .update(sections)
        .set(updates)
        .where(eq(sections.id, sectionId));

      const [updated] = await db
        .select()
        .from(sections)
        .where(eq(sections.id, sectionId));
      return c.json(updated);
    },
  )
  .delete("/sections/:id", authMiddleware("ADMIN"), async (c) => {
    const sectionId = c.req.param("id");

    const [existing] = await db
      .select()
      .from(sections)
      .where(
        and(
          eq(sections.id, sectionId),
          eq(sections.entityType, "presets_page"),
          eq(sections.entityId, "singleton"),
        ),
      );

    if (!existing) {
      return c.json({ error: "Section not found" }, 404);
    }

    await db.delete(sections).where(eq(sections.id, sectionId));
    return c.json({ success: true });
  })
  .post(
    "/sections/reorder",
    authMiddleware("ADMIN"),
    zValidator(
      "json",
      z.object({ ordered_ids: z.array(z.string()).min(1) }),
    ),
    async (c) => {
      const { ordered_ids } = c.req.valid("json");

      const existingRows = await db
        .select({ id: sections.id })
        .from(sections)
        .where(
          and(
            eq(sections.entityType, "presets_page"),
            eq(sections.entityId, "singleton"),
          ),
        );
      const existingIds = new Set(existingRows.map((r) => r.id));

      if (ordered_ids.length !== existingIds.size) {
        return c.json(
          { error: "All section ids must be present" },
          400,
        );
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
  );
