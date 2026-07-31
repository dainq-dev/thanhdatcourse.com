import { cookies } from "next/headers";
import { cache } from "react";
import { api } from "./api";

interface SettingRow {
  key: string;
  value: string;
}

export function applyPreviewSettings(
  dbSettings: Record<string, string>,
  rawCookie: string | null | undefined,
): Record<string, string> {
  if (!rawCookie) return dbSettings;

  try {
    const decoded = decodeURIComponent(rawCookie);
    if (decoded === "undefined" || decoded === "null") return dbSettings;
    const overrides: Record<string, string> = JSON.parse(decoded);
    if (typeof overrides !== "object" || overrides === null) return dbSettings;
    return { ...dbSettings, ...overrides };
  } catch {
    return dbSettings;
  }
}

async function getPreviewOverrides(): Promise<Record<string, string> | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("preview_settings")?.value;
    if (!raw) return null;

    const decoded = decodeURIComponent(raw);
    if (decoded === "undefined" || decoded === "null") return null;
    const parsed: Record<string, string> = JSON.parse(decoded);
    if (typeof parsed !== "object" || parsed === null) return null;
    return Object.keys(parsed).length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchSettings(): Promise<Record<string, string>> {
  try {
    const res = await api.fetch("/api/settings", {
      next: { revalidate: 60 },
    });
    const rows: SettingRow[] = await res.json();

    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }

    const preview = await getPreviewOverrides();
    return preview ? { ...map, ...preview } : map;
  } catch {
    return {};
  }
}

export const getSiteSettings = cache(fetchSettings);

export function parseSetting<T>(
  settings: Record<string, string>,
  key: string,
  fallback: T,
): T {
  try {
    const val = settings[key];
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}
