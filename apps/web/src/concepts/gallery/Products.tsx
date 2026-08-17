import { productThumb } from "../shared/thumb";
import styles from "./styles.module.scss";
import type { ProductsProps } from "../types";

export function Products({ settings, products }: ProductsProps) {
  const heroTitle = settings.presets_page_title || "Presets & LUTs";
  const heroSubtitle =
    settings.presets_page_subtitle ||
    "Bộ sưu tập presets và LUTs chuyên nghiệp dành cho video editor";

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          {heroSubtitle && (
            <p className={styles.heroSubtitle}>{heroSubtitle}</p>
          )}
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.masonry}>
            {products.map((p) => (
              <a
                key={p.id}
                href={p.externalCheckoutUrl || "/cong-cu"}
                target={p.externalCheckoutUrl ? "_blank" : undefined}
                rel={p.externalCheckoutUrl ? "noopener noreferrer" : undefined}
                className={styles.masonryItem}
              >
                <div className={styles.card}>
                  <img
                    src={productThumb(p)}
                    alt={p.title}
                    className={styles.cardImg}
                  />
                  <div className={styles.cardOverlay} />
                  <div className={styles.cardBody}>
                    {p.tag && <span className={styles.cardMeta}>{p.tag}</span>}
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <span className={styles.cardMeta}>
                      {p.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {products.length === 0 && (
            <p className={styles.empty}>Chưa có sản phẩm nào</p>
          )}
        </div>
      </section>
    </div>
  );
}
