import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { siteSettings } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const BatchSchema = z.record(z.string(), z.string());

export const settingsRoutes = new Hono()
  .get("/", async (c) => {
    const rows = await db.select().from(siteSettings);
    c.header("Cache-Control", "public, max-age=60");
    return c.json(rows);
  })
  .put(
    "/batch",
    authMiddleware("ADMIN"),
    zValidator("json", BatchSchema),
    async (c) => {
      const batch = c.req.valid("json");
      let count = 0;
      for (const [key, value] of Object.entries(batch)) {
        await db
          .insert(siteSettings)
          .values({ key, value, updatedAt: new Date().toISOString() })
          .onConflictDoUpdate({
            target: siteSettings.key,
            set: { value, updatedAt: new Date().toISOString() },
          });
        count++;
      }
      return c.json({ updated: count, keys: Object.keys(batch) });
    },
  );

export type SettingsRoutes = typeof settingsRoutes;
