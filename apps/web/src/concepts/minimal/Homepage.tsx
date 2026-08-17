import { parseSetting } from "@/lib/settings";
import { PromotionBanner } from "@/components/sections/promotion-banner";
import { getHeroData } from "../shared/hero-data";
import { HeroVideo } from "../shared/hero-video";
import { portfolioThumb } from "../shared/thumb";
import styles from "./styles.module.scss";
import type { HomepageProps, PortfolioItem } from "../types";

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

  const workItems = portfolios.slice(0, 3);
  const productRows = [
    ...courses.slice(0, 2).map((c) => ({
      id: c.id,
      title: c.title,
      desc: c.description,
      price: `${c.basePrice.toLocaleString("vi-VN")}đ`,
      href: `/khoa-hoc/${c.slug}`,
    })),
    ...products.slice(0, 2).map((p) => ({
      id: p.id,
      title: p.title,
      desc: p.description,
      price: `${p.price.toLocaleString("vi-VN")}đ`,
      href: p.externalCheckoutUrl || "/cong-cu",
    })),
  ];

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <HeroVideo hero={hero} />
        <div className={styles.heroInner}>
          {hero.logoType === "image" ? (
            <img
              src={hero.logoUrl}
              alt="Minh Travel"
              className={styles.heroLogo}
            />
          ) : (
            <span className={styles.heroLabel}>{hero.logoText}</span>
          )}
          <h1 className={styles.heroTitle}>{hero.tagline}</h1>
          <div className={styles.heroActions}>
            <a href={hero.btn1Url} className={styles.heroBtnSecondary}>
              {hero.btn1Text}
            </a>
            <a href={hero.btn2Url} className={styles.heroBtnPrimary}>
              {hero.btn2Text}
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
          <span className={styles.sectionLabel}>Dự án</span>
          <h2 className={styles.sectionHeading}>
            {settings.home_work_heading || "Dự án nổi bật"}
          </h2>
          {workItems.map((item: PortfolioItem) => (
            <a
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
                <h3 className={styles.workTitle}>{item.title}</h3>
                <span className={styles.workCat}>{item.category}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <span className={styles.sectionLabel}>Sản phẩm</span>
          <h2 className={styles.sectionHeading}>
            {settings.home_products_heading || "Sản phẩm"}
          </h2>
          {productRows.map((p) => (
            <a key={p.id} href={p.href} className={styles.productRow}>
              <div>
                <h3 className={styles.productTitle}>{p.title}</h3>
                <p className={styles.productDesc}>{p.desc}</p>
              </div>
              <span className={styles.productPrice}>{p.price}</span>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <span className={styles.sectionLabel}>Số liệu</span>
          <div className={styles.counters}>
            {counters.map((c: { label: string; value: number }) => (
              <div key={c.label} className={styles.counterItem}>
                <span className={styles.counterValue}>
                  {c.value.toLocaleString("en-US")}
                </span>
                <span className={styles.counterLabel}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.aboutInner}`}>
          <span className={styles.sectionLabel}>Giới thiệu</span>
          <p className={styles.aboutText}>{about1}</p>
          <p className={styles.aboutText}>{about2}</p>
        </div>
      </section>
    </div>
  );
}
