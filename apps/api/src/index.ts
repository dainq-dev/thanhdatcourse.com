import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { bonusRoutes } from "./routes/bonuses";
import { categoryRoutes } from "./routes/categories";
import { coursesRoutes } from "./routes/courses";
import { faqRoutes } from "./routes/faqs";
import { courseInstructorRoutes, instructorRoutes } from "./routes/instructors";
import { leadRoutes } from "./routes/leads";
import { lessonRoutes } from "./routes/lessons";
import { moduleRoutes } from "./routes/modules";
import { portfolioRoutes } from "./routes/portfolios";
import { postsRoutes } from "./routes/posts";
import { productRoutes } from "./routes/products";
import { promotionRoutes } from "./routes/promotions";
import { settingsRoutes } from "./routes/settings";
import { testimonialRoutes } from "./routes/testimonials";

const app = new Hono()
  .use("*", cors())
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status);
    }
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal server error", code: 500 }, 500);
  })
  .get("/", (c) =>
    c.json({ service: "thanhdatcomputer API", version: "1.0.0" }),
  )
  .route("/api/auth", authRoutes)
  .route("/api/settings", settingsRoutes)
  .route("/api/admin", adminRoutes)
  .route("/api/courses", coursesRoutes)
  .route("/api/courses/:courseId/modules", moduleRoutes)
  .route("/api/modules/:moduleId/lessons", lessonRoutes)
  .route("/api/courses/:courseId/bonuses", bonusRoutes)
  .route("/api/posts", postsRoutes)
  .route("/api/categories", categoryRoutes)
  .route("/api/leads", leadRoutes)
  .route("/api/portfolios", portfolioRoutes)
  .route("/api/products", productRoutes)
  .route("/api/faqs", faqRoutes)
  .route("/api/testimonials", testimonialRoutes)
  .route("/api/promotions", promotionRoutes)
  .route("/api/instructors", instructorRoutes)
  .route("/api", courseInstructorRoutes);

export default {
  port: 3001,
  fetch: app.fetch,
};
export type AppType = typeof app;
