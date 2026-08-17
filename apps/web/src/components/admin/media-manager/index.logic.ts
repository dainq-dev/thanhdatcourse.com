import type { MediaFile, MediaFilter, MediaListResponse } from "./types";
import { MEDIA_URL } from "@/lib/env";

const MEDIA_BASE = MEDIA_URL;

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  return { Authorization: `Bearer ${token}` };
}

function authToken(): string {
  return typeof window !== "undefined"
    ? localStorage.getItem("token") || ""
    : "";
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

export async function fetchMediaListSorted(
  filter: MediaFilter,
  page: number,
  search: string,
  sort: string,
  limit = 20,
): Promise<MediaListResponse> {
  const url = new URL(`${MEDIA_BASE}/api/media`);
  if (filter !== "all") url.searchParams.set("type", filter);
  if (search) url.searchParams.set("search", search);
  if (sort) url.searchParams.set("sort", sort);
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

export function uploadFileWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${MEDIA_BASE}/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${authToken()}`);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid response from server"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error || "Upload thất bại"));
        } catch {
          reject(new Error("Upload thất bại"));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload thất bại")));
    xhr.addEventListener("abort", () => reject(new Error("Upload bị hủy")));

    xhr.send(form);
  });
}

export async function deleteMedia(id: string): Promise<void> {
  const res = await fetch(`${MEDIA_BASE}/api/media/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Xóa thất bại");
}

export async function deleteMediaBulk(ids: string[]): Promise<void> {
  const res = await fetch(`${MEDIA_BASE}/api/media/bulk`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Xóa thất bại");
}

export async function updateAltText(
  id: string,
  altText: string,
): Promise<void> {
  const res = await fetch(`${MEDIA_BASE}/api/media/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ altText }),
  });
  if (!res.ok) throw new Error("Cập nhật alt text thất bại");
}

export async function addYoutubeVideo(youtubeUrl: string): Promise<MediaFile> {
  const res = await fetch(`${MEDIA_BASE}/external`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ source: "youtube", url: youtubeUrl }),
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ error: "Thêm YouTube thất bại" }));
    throw new Error(err.error || "Thêm YouTube thất bại");
  }
  const json = await res.json();
  return json.data ?? json;
}

export function getMediaUrl(file: MediaFile): string {
  if (file.source === "youtube") {
    const vid = file.youtubeId || file.diskPath;
    return `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
  }
  if (file.mimeType?.startsWith("image/")) {
    return `${MEDIA_BASE}/img/${file.id}/thumbnail`;
  }
  const rawPath = file.diskPath.replace("data/uploads/", "");
  return `${MEDIA_BASE}/raw/${rawPath}`;
}

export function getMediaVariantUrls(
  file: MediaFile,
): { label: string; url: string }[] {
  if (file.source === "youtube") {
    const vid = file.youtubeId || file.diskPath;
    return [
      {
        label: "Thumbnail",
        url: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      },
      {
        label: "HD",
        url: `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`,
      },
      { label: "SD", url: `https://img.youtube.com/vi/${vid}/sddefault.jpg` },
    ];
  }
  if (file.mimeType?.startsWith("image/")) {
    return [
      { label: "Thumbnail", url: `${MEDIA_BASE}/img/${file.id}/thumbnail` },
      { label: "Medium", url: `${MEDIA_BASE}/img/${file.id}/medium` },
      { label: "Large", url: `${MEDIA_BASE}/img/${file.id}/large` },
    ];
  }
  const rawPath = file.diskPath.replace("data/uploads/", "");
  return [{ label: "Raw", url: `${MEDIA_BASE}/raw/${rawPath}` }];
}
