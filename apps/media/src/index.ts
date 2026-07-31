import { Hono } from "hono";
import { cors } from "hono/cors";
import { externalRoutes } from "./routes/external";
import { imageRoutes } from "./routes/images";
import { mediaRoutes } from "./routes/media";
import { serveRawFile } from "./routes/raw";
import { uploadRoutes } from "./routes/upload";

const app = new Hono();

// Request logger
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(
    `  ${c.req.method.padEnd(6)} ${c.req.path.padEnd(30)} ${c.res.status} ${ms}ms`,
  );
});

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

app.get("/", (c) =>
  c.json({ service: "thanhdatcomputer Media", version: "1.0.0" }),
);

app.route("/upload", uploadRoutes);
app.route("/img", imageRoutes);
app.route("/raw", serveRawFile);
app.route("/api/media", mediaRoutes);
app.route("/external", externalRoutes);

export default {
  port: 3002,
  fetch: app.fetch,
};
