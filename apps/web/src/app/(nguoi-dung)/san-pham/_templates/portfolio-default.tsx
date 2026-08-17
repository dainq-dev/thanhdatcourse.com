import { Breadcrumbs, PageHeader } from "@workspace/ui";
import Link from "next/link";
import { MotionReveal } from "@/components/sections/motion-reveal";
import { getMotionConcept } from "@/lib/motion";
import styles from "../page.module.scss";

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

interface Props {
  settings: Record<string, string>;
  portfolios: PortfolioItem[];
  ctaItems: CTAItem[];
  engine?: string;
}

export function PortfolioDefault({
  settings,
  portfolios,
  ctaItems,
  engine,
}: Props) {
  const pageTitle = settings.portfolio_page_title || "Films by Minh Travel";
  const pageSubtitle = settings.portfolio_page_subtitle || "";
  const ctaHeading =
    settings.portfolio_cta_heading || "Bạn muốn làm việc cùng tôi?";
  const concept = getMotionConcept(engine, "portfolios", "parallax");

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />
      <section className={styles.projectList}>
        <Breadcrumbs
          items={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm" }]}
        />
        {engine === "masonry" ? (
          <MotionReveal concept={concept}>
            <div className={styles.masonryGrid}>
              {portfolios.map((item) => (
                <div
                  key={item.id}
                  className={styles.masonryItem}
                  data-motion-item
                >
                  <Link
                    href={`/san-pham/${item.id}`}
                    className={styles.projectThumb}
                  >
                    <img
                      src={
                        item.thumbnailUrl ||
                        (item.youtubeVideoId
                          ? `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`
                          : "")
                      }
                      alt={item.title}
                      className={styles.thumbImg}
                      loading="lazy"
                    />
                    <div className={styles.projectOverlay} />
                    <span className={styles.playIcon}>▶</span>
                  </Link>
                  <div className={styles.projectInfo}>
                    <h2 className={styles.projectTitle}>{item.title}</h2>
                    <span className={styles.categoryBadge}>
                      {item.category}
                    </span>
                    <p className={styles.projectDesc}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </MotionReveal>
        ) : (
          <MotionReveal concept={concept}>
            {portfolios.map((item) => (
              <div
                key={item.id}
                className={styles.projectItem}
                data-motion-item
              >
                <Link
                  href={`/san-pham/${item.id}`}
                  className={styles.projectThumb}
                >
                  <img
                    src={
                      item.thumbnailUrl ||
                      (item.youtubeVideoId
                        ? `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`
                        : "")
                    }
                    alt={item.title}
                    className={styles.thumbImg}
                    loading="lazy"
                  />
                  <div className={styles.projectOverlay} />
                  <span className={styles.playIcon}>▶</span>
                </Link>
                <div className={styles.projectInfo}>
                  <h2 className={styles.projectTitle}>{item.title}</h2>
                  <span className={styles.categoryBadge}>{item.category}</span>
                  <p className={styles.projectDesc}>{item.description}</p>
                </div>
              </div>
            ))}
          </MotionReveal>
        )}
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
