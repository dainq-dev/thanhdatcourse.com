import { Hono } from "hono";
import { db } from "../db";
import { courses, posts, leads } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

export const adminRoutes = new Hono()
  .get("/stats", authMiddleware("ADMIN"), async (c) => {
    const totalCourses = await db.select({ count: sql<number>`count(*)` }).from(courses);
    const publishedCourses = await db.select({ count: sql<number>`count(*)` }).from(courses).where(eq(courses.isPublished, 1));

    const totalPosts = await db.select({ count: sql<number>`count(*)` }).from(posts);
    const publishedPosts = await db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.isPublished, 1));

    const today = new Date().toISOString().split("T")[0];
    const newLeadsToday = await db.select({ count: sql<number>`count(*)` }).from(leads).where(sql`${leads.createdAt} >= ${today}`);

    const recentPosts = await db.select({ id: posts.id, title: posts.title, publishedAt: posts.publishedAt }).from(posts).orderBy(desc(posts.createdAt)).limit(5);
    const recentLeads = await db.select({ id: leads.id, customerName: leads.customerName, createdAt: leads.createdAt, status: leads.status }).from(leads).where(eq(leads.status, "NEW")).orderBy(desc(leads.createdAt)).limit(5);
    const recentCourses = await db.select({ id: courses.id, title: courses.title, updatedAt: courses.updatedAt }).from(courses).orderBy(desc(courses.updatedAt)).limit(5);

    return c.json({
      courses: { total: totalCourses[0]?.count ?? 0, published: publishedCourses[0]?.count ?? 0 },
      posts: { total: totalPosts[0]?.count ?? 0, published: publishedPosts[0]?.count ?? 0 },
      leads: { newToday: newLeadsToday[0]?.count ?? 0 },
      recentPosts,
      recentLeads,
      recentCourses,
    });
  });

export type AdminRoutes = typeof adminRoutes;
