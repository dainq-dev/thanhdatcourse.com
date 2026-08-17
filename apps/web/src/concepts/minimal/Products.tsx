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
          <span className={styles.heroLabel}>Công cụ</span>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          <p className={styles.heroTagline}>{heroSubtitle}</p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <span className={styles.sectionLabel}>Sản phẩm</span>
          <div className={styles.grid}>
            {products.map((p) => (
              <a
                key={p.id}
                href={p.externalCheckoutUrl || "/cong-cu"}
                target={p.externalCheckoutUrl ? "_blank" : undefined}
                rel={p.externalCheckoutUrl ? "noopener noreferrer" : undefined}
                className={styles.cell}
              >
                {p.tag && <span className={styles.cellTag}>{p.tag}</span>}
                <h2 className={styles.cellTitle}>{p.title}</h2>
                <p className={styles.cellDesc}>{p.description}</p>
                <span className={styles.cellPrice}>
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
