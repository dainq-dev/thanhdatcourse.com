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

export function PortfolioShowcase({
  settings,
  portfolios,
  ctaItems,
  engine,
}: Props) {
  const pageTitle = settings.portfolio_page_title || "Films by Minh Travel";
  const pageSubtitle = settings.portfolio_page_subtitle || "";
  const ctaHeading =
    settings.portfolio_cta_heading || "Bạn muốn làm việc cùng tôi?";
  const featuredId = settings.portfolio_featured_id || "";

  const featuredProject = featuredId
    ? portfolios.find((p) => p.id === featuredId)
    : portfolios[0];

  const listItems = featuredProject
    ? portfolios.filter((p) => p.id !== featuredProject.id)
    : portfolios;
  const concept = getMotionConcept(engine, "portfolios", "parallax");

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {featuredProject && (
        <section className={styles.featuredSection}>
          <div className={styles.featuredItem}>
            <Link
              href={`/san-pham/${featuredProject.id}`}
              className={styles.projectThumb}
            >
              <img
                src={
                  featuredProject.thumbnailUrl ||
                  (featuredProject.youtubeVideoId
                    ? `https://img.youtube.com/vi/${featuredProject.youtubeVideoId}/hqdefault.jpg`
                    : "")
                }
                alt={featuredProject.title}
                className={styles.thumbImg}
                loading="lazy"
              />
              <div className={styles.projectOverlay} />
              <span className={styles.playIcon}>▶</span>
            </Link>
            <div className={styles.projectInfo}>
              <h2 className={styles.projectTitle}>{featuredProject.title}</h2>
              <span className={styles.categoryBadge}>
                {featuredProject.category}
              </span>
              <p className={styles.projectDesc}>
                {featuredProject.description}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className={styles.projectList}>
        <Breadcrumbs
          items={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm" }]}
        />
        {engine === "masonry" ? (
          <MotionReveal concept={concept}>
            <div className={styles.masonryGrid}>
              {listItems.map((item) => (
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
            {listItems.map((item) => (
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
