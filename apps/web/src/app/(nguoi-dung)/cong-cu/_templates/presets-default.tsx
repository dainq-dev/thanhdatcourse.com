import { Breadcrumbs } from "@workspace/ui";
import { formatVND } from "@workspace/types";
import { MotionReveal } from "@/components/sections/motion-reveal";
import { getMotionConcept } from "@/lib/motion";
import { youtubeThumb } from "@/lib/youtube";
import { ProductGrid } from "../ProductGrid";
import styles from "../page.module.scss";

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

interface Props {
  settings: Record<string, string>;
  products: Product[];
  engine?: string;
}

export function PresetsDefault({ settings, products, engine }: Props) {
  const heroTitle = settings.presets_page_title || "Presets & LUTs";
  const heroSubtitle =
    settings.presets_page_subtitle ||
    "Bộ sưu tập presets và LUTs chuyên nghiệp dành cho video editor";
  const concept = getMotionConcept(engine, "products", "cascade");

  return (
    <main>
      <section className={styles.hero}>
        <Breadcrumbs
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Presets & LUTs" },
          ]}
        />
        <h1 className={styles.heroTitle}>{heroTitle}</h1>
        {heroSubtitle && <p className={styles.heroSubtitle}>{heroSubtitle}</p>}
      </section>

      {products.length === 0 ? (
        <p className={styles.empty}>Chưa có sản phẩm nào</p>
      ) : engine === "single-col" ? (
        <MotionReveal concept={concept}>
          <div className={styles.singleColList}>
            {products.map((p) => (
              <div key={p.id} className={styles.singleColCard} data-motion-item>
                <div className={styles.media}>
                  <img
                    src={
                      p.thumbnailUrl ||
                      (p.youtubePreviewId
                        ? youtubeThumb(p.youtubePreviewId)
                        : "")
                    }
                    alt={p.title}
                    loading="lazy"
                  />
                  {p.tag && <span className={styles.tag}>{p.tag}</span>}
                </div>
                <div className={styles.body}>
                  <h2 className={styles.title}>{p.title}</h2>
                  {p.description && (
                    <p className={styles.desc}>{p.description}</p>
                  )}
                  <p className={styles.price}>{formatVND(p.price)}</p>
                  {p.externalCheckoutUrl && (
                    <a
                      href={p.externalCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.buyBtn}
                    >
                      Mua ngay
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </MotionReveal>
      ) : (
        <ProductGrid
          engine={engine}
          products={products.map((p) => ({
            ...p,
            youtubeThumb: p.youtubePreviewId
              ? youtubeThumb(p.youtubePreviewId)
              : undefined,
            priceFormatted: formatVND(p.price),
          }))}
        />
      )}
    </main>
  );
}
