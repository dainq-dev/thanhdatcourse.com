import { portfolioThumb } from "../shared/thumb";
import styles from "./styles.module.scss";
import type { PortfolioListProps } from "../types";

export function PortfolioList({
  settings,
  portfolios,
  ctaItems,
}: PortfolioListProps) {
  const pageTitle = settings.portfolio_page_title || "Films by Minh Travel";
  const pageSubtitle = settings.portfolio_page_subtitle || "";

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{pageTitle}</h1>
          {pageSubtitle && (
            <p className={styles.heroSubtitle}>{pageSubtitle}</p>
          )}
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.masonry}>
            {portfolios.map((item) => (
              <a
                key={item.id}
                href={`/san-pham/${item.id}`}
                className={styles.masonryItem}
              >
                <div className={styles.card}>
                  <img
                    src={portfolioThumb(item)}
                    alt={item.title}
                    className={styles.cardImg}
                  />
                  <div className={styles.cardOverlay} />
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <span className={styles.cardMeta}>{item.category}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {portfolios.length === 0 && (
            <p className={styles.empty}>Chưa có dự án nào</p>
          )}
        </div>
      </section>

      {ctaItems.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.actionsRow}>
              {ctaItems.map((cta, i) => (
                <a
                  key={i}
                  href={cta.href}
                  target={cta.target || "_self"}
                  rel="noopener noreferrer"
                  className={i === 0 ? styles.btnPrimary : styles.btnSecondary}
                >
                  {cta.text}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
