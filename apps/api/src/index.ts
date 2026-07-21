import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { settingsRoutes } from "./routes/settings";
import { adminRoutes } from "./routes/admin";

const app = new Hono()
  .use("*", cors())
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status);
    }
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal server error", code: 500 }, 500);
  })
  .get("/", (c) => c.json({ service: "thanhdatcomputer API", version: "1.0.0" }))
  .route("/api/auth", authRoutes)
  .route("/api/settings", settingsRoutes)
  .route("/api/admin", adminRoutes);

export default app;
export type AppType = typeof app;
