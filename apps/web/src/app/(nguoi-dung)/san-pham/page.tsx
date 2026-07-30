import { PageHeader } from "@workspace/ui";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getSiteSettings, parseSetting } from "@/lib/settings";
import styles from "./page.module.scss";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  fullVideoUrl?: string;
  youtubeVideoId?: string;
}

interface CTAItem {
  text: string;
  href: string;
  target?: string;
  className?: string;
}

async function getPortfolios(): Promise<PortfolioItem[]> {
  try {
    return await api.fetchData<PortfolioItem>("/api/portfolios", {
      next: { revalidate: 300 },
    });
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Dự án phim tiêu biểu của Minh Travel.",
};

export default async function PortfolioPage() {
  const [portfolios, settings] = await Promise.all([
    getPortfolios(),
    getSiteSettings(),
  ]);

  const pageTitle = settings.portfolio_page_title || "Films by Minh Travel";
  const pageSubtitle = settings.portfolio_page_subtitle || "";
  const ctaHeading =
    settings.portfolio_cta_heading || "Bạn muốn làm việc cùng tôi?";
  const ctaItems: CTAItem[] = parseSetting(settings, "portfolio_cta_items", [
    {
      text: "Liên hệ làm việc",
      href: "https://www.m.me/minhtravel11/",
      target: "_blank",
    },
    {
      text: "Xem nhiều video nữa",
      href: "https://www.youtube.com/@MinhTravel96",
      target: "_blank",
    },
  ]);

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />
      <section className={styles.projectList}>
        {portfolios.map((item, idx) => {
          const isReversed = idx % 2 === 1;
          return (
            <div
              key={item.id}
              className={`${styles.projectItem} ${isReversed ? styles.reversed : ""}`}
            >
              <div className={styles.projectThumb}>
                <div className={styles.projectOverlay} />
                <span className={styles.playIcon}>▶</span>
              </div>
              <div className={styles.projectInfo}>
                <h2 className={styles.projectTitle}>{item.title}</h2>
                <p className={styles.projectDesc}>{item.description}</p>
              </div>
            </div>
          );
        })}
      </section>
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>{ctaHeading}</h2>
        <div className={styles.ctaRow}>
          {ctaItems.map((cta, i) => (
            <a
              key={i}
              href={cta.href}
              target={cta.target || "_self"}
              rel="noopener noreferrer"
              className={i === 0 ? styles.ctaPrimary : styles.ctaSecondary}
            >
              {cta.text}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
