"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import styles from "./index.module.scss";

gsap.registerPlugin(ScrollTrigger);

interface Props { settings: Record<string, string> }

export function ProductSection({ settings }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  const heading = settings.home_products_heading || "Sản phẩm";

  const card1 = {
    label: settings.home_products_card1_label || "Khám phá ngay",
    title: settings.home_products_card1_title || "Khoá học",
    desc: settings.home_products_card1_desc || "Dù bạn đang sử dụng điện thoại hay muốn nâng cao khả năng kiểm soát máy ảnh, edit video. Những khoá học của mình được tạo ra để đáp ứng hết tất cả những nhu cầu đó.",
    href: settings.home_products_card1_href || "/khoa-hoc",
  };

  const card2 = {
    label: settings.home_products_card2_label || "Công cụ sáng tạo",
    title: settings.home_products_card2_title || "LUTs & Presets",
    desc: settings.home_products_card2_desc || "Tổng hợp những LUTs màu và presets ảnh được mình sử dụng trong tất cả các sản phẩm hiện tại. Sản phẩm này sẽ giúp bạn nhanh chóng đạt được màu sắc hấp dẫn, chuyên nghiệp.",
    href: settings.home_products_card2_href || "/cong-cu",
  };

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const items = sectionRef.current.querySelectorAll("[data-product-item]");
      gsap.fromTo(
        items,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" } },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <div className={styles.bento}>
        <a data-product-item href={card1.href} className={`${styles.item} ${styles.featured}`}>
          <div className={styles.itemContent}>
            <span className={styles.itemLabel}>{card1.label}</span>
            <h2 className={styles.itemTitle}>{card1.title}</h2>
            <p className={styles.itemDesc}>{card1.desc}</p>
          </div>
          <div className={styles.itemGlow} />
        </a>
        <a data-product-item href={card2.href} className={styles.item}>
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
