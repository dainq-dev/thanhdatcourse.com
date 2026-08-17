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
          <span className={styles.eyebrow}>Dự án</span>
          <h1 className={styles.heroTitle}>{pageTitle}</h1>
          {pageSubtitle && <p className={styles.heroLead}>{pageSubtitle}</p>}
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIndex}>Danh sách</span>
            <h2 className={styles.sectionTitle}>Tất cả dự án</h2>
          </div>
          {portfolios.map((item) => (
            <a
              key={item.id}
              href={`/san-pham/${item.id}`}
              className={styles.listRow}
            >
              <div>
                <h3 className={styles.listTitle}>{item.title}</h3>
                <p className={styles.listDesc}>{item.description}</p>
              </div>
              <span className={styles.listMeta}>{item.category}</span>
            </a>
          ))}
          {portfolios.length === 0 && (
            <p className={styles.empty}>Chưa có dự án nào</p>
          )}
        </div>
      </section>

      {ctaItems.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <blockquote className={styles.pullQuote}>
              {settings.portfolio_cta_heading || "Bạn muốn làm việc cùng tôi?"}
              <div className={styles.heroActions} style={{ marginTop: 24 }}>
                {ctaItems.map((cta, i) => (
                  <a
                    key={i}
                    href={cta.href}
                    target={cta.target || "_self"}
                    rel="noopener noreferrer"
                    className={
                      i === 0 ? styles.linkPrimary : styles.linkSecondary
                    }
                  >
                    {cta.text}
                  </a>
                ))}
              </div>
            </blockquote>
          </div>
        </section>
      )}
    </div>
  );
}
