import { eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { courseInstructors, instructors } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

export const instructorRoutes = new Hono()
  .get("/", async (c) => {
    const rows = await db.select().from(instructors);
    return c.json({ data: rows });
  })
  .get("/:id", async (c) => {
    const [row] = await db
      .select()
      .from(instructors)
      .where(eq(instructors.id, c.req.param("id")));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ data: row });
  })
  .post("/", authMiddleware("ADMIN"), async (c) => {
    const body = await c.req.json();
    if (!body.name) return c.json({ error: "Name is required" }, 400);
    const id = crypto.randomUUID();
    await db.insert(instructors).values({ id, ...body });
    const [row] = await db
      .select()
      .from(instructors)
      .where(eq(instructors.id, id));
    return c.json({ data: row }, 201);
  })
  .put("/:id", authMiddleware("ADMIN"), async (c) => {
    const body = await c.req.json();
    await db
      .update(instructors)
      .set(body)
      .where(eq(instructors.id, c.req.param("id")));
    const [row] = await db
      .select()
      .from(instructors)
      .where(eq(instructors.id, c.req.param("id")));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ data: row });
  })
  .delete("/:id", authMiddleware("ADMIN"), async (c) => {
    await db.delete(instructors).where(eq(instructors.id, c.req.param("id")));
    return c.json({ data: { success: true } });
  });

export const courseInstructorRoutes = new Hono()
  .get("/courses/:courseId/instructors", authMiddleware("ADMIN"), async (c) => {
    const courseId = c.req.param("courseId");
    const rows = await db
      .select({ instructorId: courseInstructors.instructorId })
      .from(courseInstructors)
      .where(eq(courseInstructors.courseId, courseId));
    const instructorIds = rows.map((r) => r.instructorId);
    if (instructorIds.length === 0) return c.json({ data: [] });
    const instructorsList = await db
      .select()
      .from(instructors)
      .where(inArray(instructors.id, instructorIds));
    return c.json({ data: instructorsList });
  })
  .put("/courses/:courseId/instructors", authMiddleware("ADMIN"), async (c) => {
    const courseId = c.req.param("courseId");
    const body = await c.req.json();
    const ids: string[] = body.instructorIds || [];
    await db
      .delete(courseInstructors)
      .where(eq(courseInstructors.courseId, courseId));
    if (ids.length > 0) {
      await db
        .insert(courseInstructors)
        .values(ids.map((iid) => ({ courseId, instructorId: iid })));
    }
    const rows = await db
      .select({ instructorId: courseInstructors.instructorId })
      .from(courseInstructors)
      .where(eq(courseInstructors.courseId, courseId));
    return c.json({
      data: { courseId, instructorIds: rows.map((r) => r.instructorId) },
    });
  });
