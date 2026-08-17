"use client";

import { useMemo } from "react";
import { SECTION_RENDER_MAP } from "./section-render-map";

function parseConfig(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export function SectionRenderer({
  sections,
  entityMeta,
}: {
  sections: Pick<
    {
      id: string;
      section_type?: string;
      sectionType?: string;
      config: unknown;
      sort_order?: number;
      sortOrder?: number;
      is_published?: boolean | number;
      isPublished?: boolean | number;
    },
    | "id"
    | "section_type"
    | "sectionType"
    | "config"
    | "sort_order"
    | "sortOrder"
    | "is_published"
    | "isPublished"
  >[];
  entityMeta?: Record<string, unknown>;
}) {
  const published = useMemo(() => {
    const p = sections.filter((s) => {
      const pub = s.is_published ?? s.isPublished;
      return pub !== false && pub !== 0;
    });
    p.sort((a, b) => {
      const ao = a.sort_order ?? a.sortOrder ?? 0;
      const bo = b.sort_order ?? b.sortOrder ?? 0;
      return ao - bo;
    });
    return p;
  }, [sections]);

  return (
    <>
      {published.map((s) => {
        const type = s.section_type ?? s.sectionType;
        const Comp = type ? SECTION_RENDER_MAP[type] : undefined;
        if (!Comp) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[SectionRenderer] Unknown section type: ${String(type)}`,
            );
          }
          return null;
        }
        const config = parseConfig(s.config);
        return <Comp key={s.id} config={config} />;
      })}
    </>
  );
}
