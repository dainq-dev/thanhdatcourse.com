import type { Metadata } from "next";
import { api } from "@/lib/api";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

export const metadata: Metadata = {
  title: "Presets & LUTs",
  description: "Bộ sưu tập presets và LUTs chuyên nghiệp",
};

export default async function PresetsPage() {
  let sections: unknown[] = [];

  try {
    const res = await api.fetch("/api/presets-page", {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    sections = json.sections || json.data?.sections || [];
  } catch {
    sections = [];
  }

  return (
    <article>
      <SectionRenderer sections={sections as Parameters<typeof SectionRenderer>[0]["sections"]} entityMeta={{}} />
    </article>
  );
}
