import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";

const app = new Hono()
  .use("*", cors())
  .onError((err, c) => {
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal server error", code: 500 }, 500);
  })
  .get("/", (c) => c.json({ service: "thanhdatcomputer API", version: "1.0.0" }))
  .route("/api/auth", authRoutes);

export default app;
export type AppType = typeof app;
