import { parseSetting } from "@/lib/settings";
import { PromotionBanner } from "@/components/sections/promotion-banner";
import { getHeroData } from "../shared/hero-data";
import { HeroVideo } from "../shared/hero-video";
import { courseThumb, portfolioThumb, productThumb } from "../shared/thumb";
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

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroVideo}>
          <HeroVideo hero={hero} />
        </div>
        <div className={styles.heroInner}>
          {hero.logoType === "image" ? (
            <img
              src={hero.logoUrl}
              alt="Minh Travel"
              className={styles.heroLogo}
            />
          ) : (
            <span className={styles.heroEyebrow}>{hero.logoText}</span>
          )}
          <h1 className={styles.heroTitle}>{hero.tagline}</h1>
          <div className={styles.actionsRow}>
            <a href={hero.btn2Url} className={styles.btnPrimary}>
              {hero.btn2Text}
            </a>
            <a href={hero.btn1Url} className={styles.btnSecondary}>
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

      <section className={styles.section}>
        <div className={styles.container}>
          {portfolios.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>
                {settings.home_work_heading || "Dự án nổi bật"}
              </h2>
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
            </>
          )}

          {courses.length > 0 && (
            <>
              <h2 className={styles.sectionTitle} style={{ marginTop: 40 }}>
                {settings.home_products_heading || "Khóa học"}
              </h2>
              <div className={styles.masonry}>
                {courses.map((course) => (
                  <a
                    key={course.id}
                    href={`/khoa-hoc/${course.slug}`}
                    className={styles.masonryItem}
                  >
                    <div className={styles.card}>
                      <img
                        src={courseThumb(course)}
                        alt={course.title}
                        className={styles.cardImg}
                      />
                      <div className={styles.cardOverlay} />
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{course.title}</h3>
                        <span className={styles.cardPrice}>
                          {course.basePrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}

          {products.length > 0 && (
            <>
              <h2 className={styles.sectionTitle} style={{ marginTop: 40 }}>
                Công cụ
              </h2>
              <div className={styles.masonry}>
                {products.map((p) => (
                  <a
                    key={p.id}
                    href={p.externalCheckoutUrl || "/cong-cu"}
                    target={p.externalCheckoutUrl ? "_blank" : undefined}
                    rel={
                      p.externalCheckoutUrl ? "noopener noreferrer" : undefined
                    }
                    className={styles.masonryItem}
                  >
                    <div className={styles.card}>
                      <img
                        src={productThumb(p)}
                        alt={p.title}
                        className={styles.cardImg}
                      />
                      <div className={styles.cardOverlay} />
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{p.title}</h3>
                        <span className={styles.cardPrice}>
                          {p.price.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Số liệu</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 24,
              textAlign: "center",
            }}
          >
            {counters.map((c: { label: string; value: number }) => (
              <div key={c.label}>
                <div
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {c.value.toLocaleString("en-US")}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#9a9a9a",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(settings.home_about_text_1 || settings.home_about_text_2) && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Giới thiệu</h2>
            <div
              style={{
                maxWidth: "46rem",
                marginInline: "auto",
                color: "#d5d5d5",
                lineHeight: 1.8,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {settings.home_about_text_1 && (
                <p style={{ margin: 0 }}>{settings.home_about_text_1}</p>
              )}
              {settings.home_about_text_2 && (
                <p style={{ margin: 0 }}>{settings.home_about_text_2}</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
