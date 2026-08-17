"use client";

import { useMotionReveal } from "@/components/sections/motion-reveal/index.logic";
import { getHomepageMotion } from "@/lib/motion";
import styles from "./index.module.scss";

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  thumbnailUrl?: string;
}

interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  tag?: string;
}

interface Props {
  settings: Record<string, string>;
  courses: CourseItem[];
  products: ProductItem[];
}

export function ProductSection({ settings, courses, products }: Props) {
  const heading = settings.home_products_heading || "Sản phẩm";
  const visible =
    settings.home_products_section_visible !== "0" &&
    settings.home_products_section_visible !== "false";
  const concept = getHomepageMotion(settings);

  const { ref } = useMotionReveal(concept);

  if (!visible) return null;

  const card1 = courses.length > 0
    ? {
        label: settings.home_products_card1_label || "Khám phá ngay",
        title: courses[0].title,
        desc: courses[0].description,
        href: `/khoa-hoc/${courses[0].slug}`,
      }
    : {
        label: settings.home_products_card1_label || "Khám phá ngay",
        title: settings.home_products_card1_title || "Khoá học",
        desc: settings.home_products_card1_desc || "Dù bạn đang sử dụng điện thoại hay muốn nâng cao khả năng kiểm soát máy ảnh, edit video. Những khoá học của mình được tạo ra để đáp ứng hết tất cả những nhu cầu đó.",
        href: settings.home_products_card1_href || "/khoa-hoc",
      };

  const card2 = products.length > 0
    ? {
        label: settings.home_products_card2_label || "Công cụ sáng tạo",
        title: products[0].title,
        desc: products[0].description,
        href: settings.home_products_card2_href || "/cong-cu",
      }
    : {
        label: settings.home_products_card2_label || "Công cụ sáng tạo",
        title: settings.home_products_card2_title || "LUTs & Presets",
        desc: settings.home_products_card2_desc || "Tổng hợp những LUTs màu và presets ảnh được mình sử dụng trong tất cả các sản phẩm hiện tại. Sản phẩm này sẽ giúp bạn nhanh chóng đạt được màu sắc hấp dẫn, chuyên nghiệp.",
        href: settings.home_products_card2_href || "/cong-cu",
      };

  return (
    <section ref={ref} className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <div className={styles.bento}>
        <a
          data-motion-item
          href={card1.href}
          className={`${styles.item} ${styles.featured}`}
        >
          <div className={styles.itemContent}>
            <span className={styles.itemLabel}>{card1.label}</span>
            <h2 className={styles.itemTitle}>{card1.title}</h2>
            <p className={styles.itemDesc}>{card1.desc}</p>
          </div>
          <div className={styles.itemGlow} />
        </a>
        <a data-motion-item href={card2.href} className={styles.item}>
          <div className={styles.itemContent}>
            <span className={styles.itemLabel}>{card2.label}</span>
            <h2 className={styles.itemTitle}>{card2.title}</h2>
            <p className={styles.itemDesc}>{card2.desc}</p>
          </div>
          <div className={styles.itemGlow} />
        </a>
      </div>
    </section>
  );
}
