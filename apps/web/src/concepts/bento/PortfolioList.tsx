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
          <div className={styles.bentoGrid}>
            {portfolios.map((item, i) => (
              <a
                key={item.id}
                href={`/san-pham/${item.id}`}
                className={`${styles.tile} ${
                  i === 0
                    ? styles.tileLg
                    : i % 3 === 0
                      ? styles.tileMd
                      : styles.tileSm
                }`}
              >
                <img
                  src={portfolioThumb(item)}
                  alt={item.title}
                  className={styles.tileImg}
                />
                <div className={styles.tileOverlay} />
                <div className={styles.tileContent}>
                  <span className={styles.tileLabel}>{item.category}</span>
                  <h2 className={styles.tileTitle}>{item.title}</h2>
                  <span className={styles.tileArrow}>Xem →</span>
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
