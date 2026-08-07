import { cookies } from "next/headers";
import { PageBuilder } from "@/components/admin/page-builder/PageBuilder";
import type { Section } from "@/components/admin/page-builder/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchSections(entityType: string, entityIdentifier: string): Promise<Section[]> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token");
    const token = tokenCookie?.value || "";

    const res = await fetch(`${API_URL}/api/${entityType}/${entityIdentifier}/sections`, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.data ?? [];
  } catch { return []; }
}

export default async function ProductBuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialSections = await fetchSections("product", id);
  return <PageBuilder entityType="product" entityIdentifier={id} initialSections={initialSections} />;
}
