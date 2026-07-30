export function resolveMediaUrl(mediaId: string, variant: "medium" | "thumbnail" | "full" = "medium"): string {
  if (!mediaId) return "";
  if (mediaId.startsWith("http")) return mediaId;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mediaId)) {
    return `/img/${mediaId}/${variant}`;
  }
  const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_URL || "";
  if (MEDIA_BASE) return `${MEDIA_BASE}/img/${mediaId}/${variant}`;
  return `/img/${mediaId}/${variant}`;
}

export function resolveYoutubeThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
