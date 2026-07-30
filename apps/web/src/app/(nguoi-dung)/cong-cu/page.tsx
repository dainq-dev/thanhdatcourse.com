import { PageHeader } from "@workspace/ui";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import styles from "./page.module.scss";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  externalCheckoutUrl?: string;
  tag?: string;
}

async function getProducts(): Promise<Product[]> {
  try {
    return await api.fetchData<Product>("/api/products?published=true", {
      next: { revalidate: 300 },
    });
  } catch {
    return [];
  }
}

export const metadata: Metadata = { title: "Preset & LUTs" };

export default async function PresetsPage() {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSiteSettings(),
  ]);
  const pageTitle =
    settings.presets_page_title || "LUTs & Presets by Minh Travel";
  const pageSub =
    settings.presets_page_subtitle ||
    "Bộ công cụ giúp bạn dễ dàng chỉnh sửa màu sắc...";
  const btnText = settings.presets_page_btn_text || "Mua ngay";

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageSub} />
      <section className={styles.productList}>
        {products.map((p) => (
          <div key={p.id} className={styles.productItem}>
            <div className={styles.productThumb}>▶</div>
            <div>
              <h2 className={styles.productTitle}>{p.title}</h2>
              <p className={styles.productDesc}>{p.description}</p>
              <a
                href={p.externalCheckoutUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.buyBtn}
              >
                {btnText}
              </a>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
