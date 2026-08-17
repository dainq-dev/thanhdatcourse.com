import Link from "next/link";
import { portfolioThumb } from "../shared/thumb";
import styles from "./styles.module.scss";
import type { PortfolioListProps } from "../types";

export function PortfolioList({
  settings,
  portfolios,
  ctaItems,
}: PortfolioListProps) {
  const pageTitle = settings.portfolio_page_title || "Films by Minh Travel";
  const ctaHeading =
    settings.portfolio_cta_heading || "Bạn muốn làm việc cùng tôi?";

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroLabel}>Dự án</span>
          <h1 className={styles.heroTitle}>{pageTitle}</h1>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <span className={styles.sectionLabel}>Tất cả dự án</span>
          {portfolios.map((item) => (
            <Link
              key={item.id}
              href={`/san-pham/${item.id}`}
              className={styles.workRow}
            >
              <img
                src={portfolioThumb(item)}
                alt={item.title}
                className={styles.workThumb}
              />
              <div>
                <h2 className={styles.workTitle}>{item.title}</h2>
                <span className={styles.workCat}>{item.category}</span>
              </div>
            </Link>
          ))}
          {portfolios.length === 0 && (
            <p className={styles.empty}>Chưa có dự án nào</p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.aboutInner}`}>
          <h2 className={styles.sectionHeading}>{ctaHeading}</h2>
          <div className={styles.heroActions}>
            {ctaItems.map((cta, i) => (
              <a
                key={i}
                href={cta.href}
                target={cta.target || "_self"}
                rel="noopener noreferrer"
                className={
                  i === 0 ? styles.heroBtnPrimary : styles.heroBtnSecondary
                }
              >
                {cta.text}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
