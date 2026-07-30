import { Hono } from "hono";
import { db } from "../db";
import { media } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

export const externalRoutes = new Hono().post(
  "/",
  authMiddleware("ADMIN"),
  async (c) => {
    const body = await c.req.json();
    const { source, url, altText } = body;

    if (!source || !["youtube", "external_url"].includes(source)) {
      return c.json(
        { error: "Source must be 'youtube' or 'external_url'" },
        400,
      );
    }
    if (!url) return c.json({ error: "URL is required" }, 400);

    const id = crypto.randomUUID();
    let youtubeId: string | undefined;
    let externalUrl: string | undefined;

    if (source === "youtube") {
      // Extract video ID from various YouTube URL formats
      const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      );
      if (!match) return c.json({ error: "Invalid YouTube URL" }, 400);
      youtubeId = match[1];
      // Use YouTube thumbnail as external URL
      externalUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    } else {
      externalUrl = url;
    }

    await db.insert(media).values({
      id,
      originalName:
        source === "youtube"
          ? `youtube-${youtubeId}`
          : new URL(url).pathname.split("/").pop() || "external",
      storedName: "external-ref",
      mimeType: source === "youtube" ? "video/youtube" : "image/external",
      fileSize: 0,
      width: source === "youtube" ? 1280 : undefined,
      height: source === "youtube" ? 720 : undefined,
      source,
      externalUrl,
      youtubeId,
      altText,
      diskPath: `external://${externalUrl}`,
    });

    const [row] = await db.select().from(media).where(eq(media.id, id));
    return c.json({ data: row }, 201);
  },
);
