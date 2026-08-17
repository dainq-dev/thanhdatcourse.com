import { parseSetting } from "@/lib/settings";
import { PromotionBanner } from "@/components/sections/promotion-banner";
import { getHeroData } from "../shared/hero-data";
import { HeroVideo } from "../shared/hero-video";
import { courseThumb, portfolioThumb } from "../shared/thumb";
import styles from "./styles.module.scss";
import type { HomepageProps } from "../types";

const DEFAULT_COUNTERS = [
  { label: "Facebook followers", value: 38760 },
  { label: "Instagram followers", value: 14856 },
  { label: "YouTube subscribers", value: 112287 },
  { label: "Tiktok followers", value: 443238 },
];

const DEFAULT_ABOUT_1 =
  "Minh Travel nổi bật với phong cách quay và biên tập video độc đáo, đã truyền cảm hứng cho rất nhiều bạn trẻ theo công việc sáng tạo nội dung.";
const DEFAULT_ABOUT_2 =
  "Hợp tác với Minh có nghĩa là có cơ hội tiếp cận một trong những đám đông đam mê du lịch, sáng tạo trên internet hiện nay.";

export function Homepage({
  settings,
  portfolios,
  courses,
  products,
}: HomepageProps) {
  const counters = parseSetting(settings, "home_counters", DEFAULT_COUNTERS);
  const about1 = settings.home_about_text_1 || DEFAULT_ABOUT_1;
  const about2 = settings.home_about_text_2 || DEFAULT_ABOUT_2;
  const hero = getHeroData(settings);

  const featuredPortfolio = portfolios[0];
  const featuredCourse = courses[0];
  const featuredProduct = products[0];

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroVideo}>
          <HeroVideo hero={hero} />
        </div>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            Minh Travel — Filmmaker & Creator
          </span>
          <h1 className={styles.heroTitle}>{hero.tagline}</h1>
          <p className={styles.heroLead}>
            Từ những chuyến đi, những thước phim và những câu chuyện được kể
            bằng ánh sáng — nơi đam mê quay dựng trở thành hành trình.
          </p>
          <div className={styles.heroActions}>
            <a href={hero.btn2Url} className={styles.linkPrimary}>
              {hero.btn2Text}
            </a>
            <a href={hero.btn1Url} className={styles.linkSecondary}>
              {hero.btn1Text}
            </a>
          </div>
          {hero.brands.length > 0 && (
            <div className={styles.brandRow}>
              {hero.brands.map((b) => (
                <span key={b} className={styles.brandItem}>
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <PromotionBanner />

      {featuredPortfolio && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionIndex}>01 / Dự án tiêu biểu</span>
              <h2 className={styles.sectionTitle}>
                Những câu chuyện bằng hình ảnh
              </h2>
            </div>
            <div className={styles.featureGrid}>
              <img
                src={portfolioThumb(featuredPortfolio)}
                alt={featuredPortfolio.title}
                className={styles.featureImg}
              />
              <div>
                <h3 className={styles.featureTitle}>
                  {featuredPortfolio.title}
                </h3>
                <p className={styles.featureDesc}>
                  {featuredPortfolio.description}
                </p>
                <a
                  href={`/san-pham/${featuredPortfolio.id}`}
                  className={styles.featureMeta}
                >
                  Xem dự án →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {featuredCourse && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionIndex}>02 / Khóa học</span>
              <h2 className={styles.sectionTitle}>
                Học từ những trải nghiệm thật
              </h2>
            </div>
            <div className={styles.featureGrid}>
              <div>
                <h3 className={styles.featureTitle}>{featuredCourse.title}</h3>
                <p className={styles.featureDesc}>
                  {featuredCourse.description}
                </p>
                <a
                  href={`/khoa-hoc/${featuredCourse.slug}`}
                  className={styles.featureMeta}
                >
                  Xem khóa học →
                </a>
              </div>
              <img
                src={courseThumb(featuredCourse)}
                alt={featuredCourse.title}
                className={styles.featureImg}
              />
            </div>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIndex}>03 / Số liệu</span>
            <h2 className={styles.sectionTitle}>Cộng đồng sáng tạo</h2>
          </div>
          <div className={styles.counterStrip}>
            {counters.map((c: { label: string; value: number }) => (
              <div key={c.label}>
                <span className={styles.counterValue}>
                  {c.value.toLocaleString("en-US")}
                </span>
                <span className={styles.counterLabel}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredProduct && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionIndex}>04 / Công cụ</span>
              <h2 className={styles.sectionTitle}>{featuredProduct.title}</h2>
            </div>
            <blockquote className={styles.pullQuote}>
              {featuredProduct.description}
              <div className={styles.pullQuoteAuthor}>
                {featuredProduct.price.toLocaleString("vi-VN")}đ
              </div>
            </blockquote>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIndex}>05 / Giới thiệu</span>
            <h2 className={styles.sectionTitle}>Về Minh Travel</h2>
          </div>
          <blockquote className={styles.pullQuote}>
            {about1}
            <p className={styles.pullQuoteAuthor} style={{ marginTop: 24 }}>
              {about2}
            </p>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
