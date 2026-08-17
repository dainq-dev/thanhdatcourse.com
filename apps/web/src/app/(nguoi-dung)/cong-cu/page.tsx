import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import { getConcept } from "@/concepts";

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

export default async function PresetsPage() {
  const [products, settings] = await Promise.all([
    fetchProducts(),
    getSiteSettings(),
  ]);

  const { module } = getConcept(settings.site_concept);
  const ProductsView = module.Products;

  return <ProductsView settings={settings} products={products} />;
}
