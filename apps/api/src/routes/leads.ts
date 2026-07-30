import { and, count, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { leads } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { createRateLimiter, getClientIp } from "../middleware/rate-limit";

const VALID_STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CANCELLED"] as const;

const leadLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 3600000,
  key: "leads",
}); // 3/hour

export const leadRoutes = new Hono()
  .post("/", async (c) => {
    const ip = getClientIp(c);
    if (!leadLimiter(ip)) {
      return c.json(
        { error: "Too many requests. Please try again later." },
        429,
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const { customerName, customerEmail, customerPhone, message, courseId } =
      body as {
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        message?: string;
        courseId?: string;
      };

    if (!customerName) {
      return c.json({ error: "customerName is required" }, 400);
    }
    if (!customerPhone) {
      return c.json({ error: "customerPhone is required" }, 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(leads).values({
      id,
      customerName,
      customerEmail: customerEmail ?? null,
      customerPhone,
      message: message ?? null,
      courseId: courseId ?? null,
      status: "NEW",
      createdAt: now,
    });

    const [lead] = await db.select().from(leads).where(eq(leads.id, id));

    return c.json({ lead }, 201);
  })
  .get("/", authMiddleware("ADMIN"), async (c) => {
    const status = c.req.query("status");
    const page = Math.max(1, Number(c.req.query("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(c.req.query("limit")) || 20),
    );
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) {
      conditions.push(eq(leads.status, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(leads)
      .where(where);
    const total = totalResult[0]?.count ?? 0;

    const result = await db
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({ leads: result, total, page, limit });
  })
  .put("/:id", authMiddleware("ADMIN"), async (c) => {
    const id = c.req.param("id");

    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const { status, adminNotes } = body as {
      status?: string;
      adminNotes?: string;
    };

    if (
      status &&
      !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
    ) {
      return c.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        400,
      );
    }

    const [existing] = await db.select().from(leads).where(eq(leads.id, id));
    if (!existing) {
      return c.json({ error: "Lead not found" }, 404);
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    if (Object.keys(updateData).length === 0) {
      return c.json({ lead: existing });
    }

    await db.update(leads).set(updateData).where(eq(leads.id, id));

    const [updated] = await db.select().from(leads).where(eq(leads.id, id));

    return c.json({ lead: updated });
  });

export type LeadRoutes = typeof leadRoutes;
