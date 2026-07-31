"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import styles from "./index.module.scss";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  settings: Record<string, string>;
}

export function WorkSection({ settings }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  const heading = settings.home_work_heading || "Work";

  const card1 = {
    title: settings.home_work_card1_title || "Dự án nổi bật",
    desc:
      settings.home_work_card1_desc ||
      "Tổng hợp những video được đầu tư về hình ảnh và storytelling của Minh Travel, sản xuất cùng những nhãn hàng lớn như Honda, Sony, VTV...",
    text: settings.home_work_card1_link_text || "Khám phá →",
    href: settings.home_work_card1_href || "/san-pham",
  };

  const card2 = {
    title: settings.home_work_card2_title || "Short Video",
    desc:
      settings.home_work_card2_desc ||
      "Những video short trên tiktok và các nền tảng đạt hàng trăm triệu views giúp Minh Travel tiếp cận được lượng lớn khán giả tại Việt Nam",
    text: settings.home_work_card2_link_text || "Xem trên TikTok →",
    href: settings.home_work_card2_href || "https://www.tiktok.com/@minhtravel",
  };

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const cards = sectionRef.current.querySelectorAll("[data-work-card]");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <div className={styles.grid}>
        <a
          data-work-card
          href={card1.href}
          className={`${styles.card} ${styles.left}`}
        >
          <div className={styles.cardInner}>
            <h2 className={styles.cardTitle}>{card1.title}</h2>
            <p className={styles.cardDesc}>{card1.desc}</p>
            <span className={styles.cardLink}>{card1.text}</span>
          </div>
          <div className={styles.cardGlow} />
        </a>
        <a
          data-work-card
          href={card2.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.card} ${styles.right}`}
        >
          <div className={styles.cardInner}>
            <h2 className={styles.cardTitle}>{card2.title}</h2>
            <p className={styles.cardDesc}>{card2.desc}</p>
            <span className={styles.cardLink}>{card2.text}</span>
          </div>
          <div className={styles.cardGlow} />
        </a>
      </div>
    </section>
  );
}
