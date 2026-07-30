import { existsSync, readFileSync, statSync } from "node:fs";
import { Hono } from "hono";
import { lookup } from "node:mime-types";

export const serveRawFile = new Hono().get("/*", (c) => {
  const filePath = c.req.path.replace("/raw/", "data/uploads/");
  const fullPath = `./${filePath}`;

  if (!existsSync(fullPath)) {
    return c.json({ error: "File not found" }, 404);
  }

  const stat = statSync(fullPath);
  const buf = readFileSync(fullPath);
  const ext = filePath.split(".").pop() || "";
  const mimeMap: Record<string, string> = {
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", mkv: "video/x-matroska",
    mp3: "audio/mpeg", wav: "audio/wav",
    pdf: "application/pdf", zip: "application/zip",
    svg: "image/svg+xml",
  };

  c.header("Content-Type", mimeMap[ext] || "application/octet-stream");
  c.header("Content-Length", String(stat.size));
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  return c.body(buf);
});
