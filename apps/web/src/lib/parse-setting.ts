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
