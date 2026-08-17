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
          <span className={styles.eyebrow}>Công cụ</span>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          {heroSubtitle && <p className={styles.heroLead}>{heroSubtitle}</p>}
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIndex}>Sản phẩm</span>
            <h2 className={styles.sectionTitle}>Bộ sưu tập</h2>
          </div>
          <div className={styles.grid3}>
            {products.map((p) => (
              <a
                key={p.id}
                href={p.externalCheckoutUrl || "/cong-cu"}
                target={p.externalCheckoutUrl ? "_blank" : undefined}
                rel={p.externalCheckoutUrl ? "noopener noreferrer" : undefined}
                className={styles.cardCell}
              >
                <img
                  src={productThumb(p)}
                  alt={p.title}
                  className={styles.cardImg}
                />
                {p.tag && <span className={styles.cardTag}>{p.tag}</span>}
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <p className={styles.cardDesc}>{p.description}</p>
                <span className={styles.cardPrice}>
                  {p.price.toLocaleString("vi-VN")}đ
                </span>
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
