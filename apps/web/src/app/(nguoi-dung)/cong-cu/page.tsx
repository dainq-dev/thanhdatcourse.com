import type { Metadata } from "next";
import { getPresetsEngine, type PresetsTemplateId } from "@/lib/layout-engine";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import { PresetsDefault } from "./_templates/presets-default";
import { PresetsFeatured } from "./_templates/presets-featured";

export const metadata: Metadata = {
  title: "Presets & LUTs",
  description: "Bộ sưu tập presets và LUTs chuyên nghiệp",
};

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  youtubePreviewId?: string;
  externalCheckoutUrl?: string;
  tag?: string;
}

async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await api.fetch("/api/products?published=true", {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    const products: Product[] = json.data ?? json;
    return products.filter((p) => p.tag === "LUT" || p.tag === "Preset");
  } catch {
    return [];
  }
}

const PRESETS_TEMPLATES = {
  default: PresetsDefault,
  featured: PresetsFeatured,
} as const;

export default async function PresetsPage() {
  const [products, settings] = await Promise.all([
    fetchProducts(),
    getSiteSettings(),
  ]);

  const templateId = (settings.presets_template || "default") as PresetsTemplateId;
  const Template = PRESETS_TEMPLATES[templateId] ?? PresetsDefault;
  const engine = getPresetsEngine(settings);

  return <Template settings={settings} products={products} engine={engine} />;
}
