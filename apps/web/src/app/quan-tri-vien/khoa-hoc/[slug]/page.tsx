"use client";

import { useEffect, useState } from "react";
import { PageBuilder } from "@/components/admin/page-builder/PageBuilder";
import { api } from "@/lib/api";
import type { Section } from "@/components/admin/page-builder/types";

function normalizeSections(raw: Record<string, unknown>[]): Section[] {
  return raw.map((row) => ({
    id: row.id as string,
    entity_type: (row.entityType ?? row.entity_type ?? "") as Section["entity_type"],
    entity_id: (row.entityId ?? row.entity_id ?? "") as string,
    section_type: (row.sectionType ?? row.section_type ?? "") as Section["section_type"],
    title: row.title as string | null,
    config:
      typeof row.config === "string"
        ? JSON.parse(row.config as string)
        : (row.config as Record<string, unknown> ?? {}),
    sort_order: (row.sortOrder ?? row.sort_order ?? 0) as number,
    is_published: Boolean(row.isPublished ?? row.is_published ?? true),
    created_at: (row.createdAt ?? row.created_at ?? "") as string,
    updated_at: (row.updatedAt ?? row.updated_at ?? "") as string,
  }));
}

export default function CourseBuildPage() {
  const [sections, setSections] = useState<Section[] | null>(null);
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSlugAndSections = async () => {
      try {
        const pathParts = window.location.pathname.split("/");
        const courseSlug = pathParts[pathParts.length - 1];
        setSlug(courseSlug);

        const res = await api.get<Record<string, unknown>[]>(
          `/api/course/${courseSlug}/sections`,
        );
        const raw = Array.isArray(res) ? res : (res as unknown as { data: Record<string, unknown>[] }).data ?? [];
        setSections(normalizeSections(raw));
      } catch {
        setError("Không thể tải sections. Vui lòng thử lại.");
      }
    };
    fetchSlugAndSections();
  }, []);

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--admin-text-secondary)" }}>
        {error}
      </div>
    );
  }

  if (!sections) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--admin-text-secondary)" }}>
        Đang tải...
      </div>
    );
  }

  return (
    <PageBuilder
      entityType="course"
      entityIdentifier={slug}
      initialSections={sections}
    />
  );
}
