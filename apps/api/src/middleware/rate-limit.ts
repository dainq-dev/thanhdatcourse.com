import type { Context } from "hono";

const stores = new Map<string, Map<string, number[]>>();

export function createRateLimiter(options: {
  maxRequests: number;
  windowMs: number;
  key: string;
}) {
  if (!stores.has(options.key)) stores.set(options.key, new Map());

  const store = stores.get(options.key) ?? new Map();
  if (!stores.has(options.key)) stores.set(options.key, store);

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - options.windowMs;
    const timestamps = (store.get(identifier) || []).filter(
      (t) => t > windowStart,
    );
    if (timestamps.length >= options.maxRequests) return false;
    timestamps.push(now);
    store.set(identifier, timestamps);
    return true;
  };
}

export function getClientIp(c: Context): string {
  return (
    c.req.header("X-Forwarded-For") || c.req.header("x-real-ip") || "unknown"
  );
}
