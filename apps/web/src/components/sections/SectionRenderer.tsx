"use client";

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
      section_type: string;
      config: unknown;
      sort_order?: number;
      is_published?: boolean | number;
    },
    "id" | "section_type" | "config" | "sort_order" | "is_published"
  >[];
  entityMeta?: Record<string, unknown>;
}) {
  const published = sections.filter(
    (s) => s.is_published !== false && s.is_published !== 0,
  );
  published.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <>
      {published.map((s) => {
        const Comp = SECTION_RENDER_MAP[s.section_type];
        if (!Comp) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[SectionRenderer] Unknown section type: ${s.section_type}`,
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
