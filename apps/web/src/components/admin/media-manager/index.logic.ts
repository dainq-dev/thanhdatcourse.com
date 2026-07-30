import type { MediaFile, MediaFilter, MediaListResponse } from "./types";

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_URL || "http://localhost:3002";

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  return { Authorization: `Bearer ${token}` };
}

export async function fetchMediaList(
  filter: MediaFilter,
  page: number,
  search: string,
  limit = 20,
): Promise<MediaListResponse> {
  const url = new URL(`${MEDIA_BASE}/api/media`);
  if (filter !== "all") url.searchParams.set("type", filter);
  if (search) url.searchParams.set("search", search);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error("Lỗi tải danh sách media");
  return res.json();
}

export async function uploadFile(file: File): Promise<MediaFile> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${MEDIA_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: authHeaders().Authorization },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload thất bại" }));
    throw new Error(err.error || "Upload thất bại");
  }
  return res.json();
}

export async function deleteMedia(id: string): Promise<void> {
  const res = await fetch(`${MEDIA_BASE}/api/media/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Xóa thất bại");
}

export function getMediaUrl(file: MediaFile): string {
  if (file.source === "youtube") {
    return `https://img.youtube.com/vi/${file.diskPath}/hqdefault.jpg`;
  }
  if (file.mimeType?.startsWith("image/")) {
    return `${MEDIA_BASE}/img/${file.id}/thumbnail`;
  }
  // Video, audio, documents — serve via media service raw endpoint
  const rawPath = file.diskPath.replace("data/uploads/", "");
  return `${MEDIA_BASE}/raw/${rawPath}`;
}
