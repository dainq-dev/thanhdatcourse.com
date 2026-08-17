import { MEDIA_URL } from "./env";

export function resolveMediaUrl(
  mediaId: string,
  variant: "medium" | "thumbnail" | "large" = "medium",
): string {
  if (!mediaId) return "";
  if (mediaId.startsWith("http")) return mediaId;
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      mediaId,
    )
  ) {
    return `/img/${mediaId}/${variant}`;
  }
  if (MEDIA_URL) return `${MEDIA_URL}/img/${mediaId}/${variant}`;
  return `/img/${mediaId}/${variant}`;
}

export function resolveYoutubeThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
