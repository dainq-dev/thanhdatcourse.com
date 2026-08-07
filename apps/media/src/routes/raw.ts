import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";
import { Hono } from "hono";

const UPLOADS_ROOT = resolve("data/uploads");

export const serveRawFile = new Hono().get("/*", (c) => {
  const rawPath = c.req.path.replace("/raw/", "");
  const resolved = resolve(UPLOADS_ROOT, rawPath);

  if (!resolved.startsWith(UPLOADS_ROOT + sep)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (!existsSync(resolved)) {
    return c.json({ error: "File not found" }, 404);
  }

  const stat = statSync(resolved);
  const buf = readFileSync(resolved);
  const ext = rawPath.split(".").pop() || "";
  const mimeMap: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    pdf: "application/pdf",
    zip: "application/zip",
    svg: "image/svg+xml",
  };

  c.header("Content-Type", mimeMap[ext] || "application/octet-stream");
  c.header("Content-Length", String(stat.size));
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  return c.body(buf);
});
