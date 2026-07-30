const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private static instance: ApiClient;

  static get(): ApiClient {
    return ApiClient.instance ?? (ApiClient.instance = new ApiClient());
  }

  private constructor() {}

  // ── Server-side (no token, supports Next.js fetch cache/revalidate) ──

  async fetch(
    path: string,
    init?: RequestInit & {
      next?: NextFetchRequestConfig;
      cache?: RequestCache;
    },
  ): Promise<Response> {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });
    return res;
  }

  // ── Server-side fetch + auto extract .data ──

  async fetchData<T>(path: string, init?: RequestInit & { next?: NextFetchRequestConfig; cache?: RequestCache }): Promise<T[]> {
    const res = await this.fetch(path, init);
    const json = await res.json();
    return json.data ?? json;
  }

  private get token(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  }

  private authHeaders(extra?: Record<string, string>): Record<string, string> {
    return extra
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
          ...extra,
        }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        };
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${BASE}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, v);
      });
    }
    const res = await fetch(url.toString(), { headers: this.authHeaders() });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: this.authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: "PUT",
      headers: this.authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async del(path: string): Promise<void> {
    const res = await fetch(`${BASE}${path}`, {
      method: "DELETE",
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
  }

  // ── Public (no auth) ──

  async submit<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async publicGet<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail?: string,
  ) {
    super(detail || `API error ${status}`);
    this.name = "ApiError";
  }
}

export const api = ApiClient.get();

export function extractData<T>(result: T[] | { data: T[] }): T[] {
  return Array.isArray(result) ? result : (result.data ?? []);
}
