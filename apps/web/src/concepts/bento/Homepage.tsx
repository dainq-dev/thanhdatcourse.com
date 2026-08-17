import { parseSetting } from "@/lib/settings";
import { PromotionBanner } from "@/components/sections/promotion-banner";
import { getHeroData } from "../shared/hero-data";
import { HeroVideo } from "../shared/hero-video";
import { portfolioThumb } from "../shared/thumb";
import styles from "./styles.module.scss";
import type { HomepageProps } from "../types";

const DEFAULT_COUNTERS = [
  { label: "Facebook followers", value: 38760 },
  { label: "Instagram followers", value: 14856 },
  { label: "YouTube subscribers", value: 112287 },
  { label: "Tiktok followers", value: 443238 },
];

export function Homepage({
  settings,
  portfolios,
  courses,
  products,
}: HomepageProps) {
  const counters = parseSetting(settings, "home_counters", DEFAULT_COUNTERS);
  const hero = getHeroData(settings);
  const about1 = settings.home_about_text_1 || "";
  const about2 = settings.home_about_text_2 || "";

  const featuredPortfolio = portfolios[0];
  const featuredCourse = courses[0];
  const featuredProduct = products[0];

  return (
    <div className={styles.root}>
      <div className={styles.container} style={{ paddingTop: 24 }}>
        <div className={styles.bentoGrid}>
          <div className={`${styles.tile} ${styles.tileHero}`}>
            <div style={{ position: "absolute", inset: 0 }}>
              <HeroVideo hero={hero} />
            </div>
            <div className={styles.tileOverlay} />
            <div className={styles.tileContent}>
              <span className={styles.tileLabel}>
                {hero.logoType === "text" ? hero.logoText : "Minh Travel"}
              </span>
              <h1
                className={styles.tileTitle}
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                {hero.tagline}
              </h1>
              <div className={styles.tileActions}>
                <a href={hero.btn2Url} className={styles.btnPrimary}>
                  {hero.btn2Text}
                </a>
                <a href={hero.btn1Url} className={styles.btnSecondary}>
                  {hero.btn1Text}
                </a>
              </div>
            </div>
          </div>

          {hero.brands.length > 0 && (
            <div className={`${styles.tile} ${styles.tileWide}`}>
              <div className={styles.tileContent}>
                <span className={styles.tileLabel}>Thương hiệu hợp tác</span>
                <div className={styles.brandRow}>
                  {hero.brands.map((b) => (
                    <span key={b} className={styles.brandItem}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {featuredPortfolio && (
            <a
              href={`/san-pham/${featuredPortfolio.id}`}
              className={`${styles.tile} ${styles.tileLg}`}
            >
              <img
                src={portfolioThumb(featuredPortfolio)}
                alt=""
                className={styles.tileImg}
              />
              <div className={styles.tileOverlay} />
              <div className={styles.tileContent}>
                <span className={styles.tileLabel}>Dự án nổi bật</span>
                <h2 className={styles.tileTitle}>{featuredPortfolio.title}</h2>
                <span className={styles.tileArrow}>Khám phá →</span>
              </div>
            </a>
          )}

          {featuredCourse && (
            <a
              href={`/khoa-hoc/${featuredCourse.slug}`}
              className={`${styles.tile} ${styles.tileMd}`}
            >
              <div className={styles.tileContent}>
                <span className={styles.tileLabel}>Khóa học</span>
                <h2 className={styles.tileTitle}>{featuredCourse.title}</h2>
                <span className={styles.tileArrow}>Xem chi tiết →</span>
              </div>
            </a>
          )}

          {featuredProduct && (
            <a
              href={featuredProduct.externalCheckoutUrl || "/cong-cu"}
              target={
                featuredProduct.externalCheckoutUrl ? "_blank" : undefined
              }
              rel={
                featuredProduct.externalCheckoutUrl
                  ? "noopener noreferrer"
                  : undefined
              }
              className={`${styles.tile} ${styles.tileMd}`}
            >
              <div className={styles.tileContent}>
                <span className={styles.tileLabel}>Công cụ</span>
                <h2 className={styles.tileTitle}>{featuredProduct.title}</h2>
                <span className={styles.tilePrice}>
                  {featuredProduct.price.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </a>
          )}

          {counters.map((c: { label: string; value: number }) => (
            <div key={c.label} className={`${styles.tile} ${styles.tileSm}`}>
              <div className={styles.tileContent}>
                <span className={styles.tileCounter}>
                  {c.value.toLocaleString("en-US")}
                </span>
                <span className={styles.tileCounterLabel}>{c.label}</span>
              </div>
            </div>
          ))}

          {(about1 || about2) && (
            <div className={`${styles.tile} ${styles.tileWide}`}>
              <div className={styles.tileContent}>
                <span className={styles.tileLabel}>Giới thiệu</span>
                <p className={styles.tileDesc}>{about1 || about2}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <PromotionBanner />
    </div>
  );
}
