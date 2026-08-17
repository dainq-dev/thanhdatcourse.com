export function portfolioThumb(item: {
  thumbnailUrl?: string | null;
  youtubeVideoId?: string | null;
}): string {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  if (item.youtubeVideoId)
    return `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`;
  return "";
}

export function courseThumb(item: {
  thumbnailUrl?: string | null;
}): string {
  return item.thumbnailUrl || "/placeholder-course.jpg";
}

export function productThumb(item: {
  thumbnailUrl?: string | null;
  youtubePreviewId?: string | null;
}): string {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  if (item.youtubePreviewId)
    return `https://img.youtube.com/vi/${item.youtubePreviewId}/hqdefault.jpg`;
  return "";
}
