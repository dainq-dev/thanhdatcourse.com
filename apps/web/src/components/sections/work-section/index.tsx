"use client";

import { useMotionReveal } from "@/components/sections/motion-reveal/index.logic";
import { getHomepageMotion } from "@/lib/motion";
import styles from "./index.module.scss";

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  youtubeVideoId?: string;
  featuredOrder: number;
}

interface Props {
  settings: Record<string, string>;
  portfolios: PortfolioItem[];
}

export function WorkSection({ settings, portfolios }: Props) {
  const heading = settings.home_work_heading || "Work";
  const visible =
    settings.home_work_section_visible !== "0" &&
    settings.home_work_section_visible !== "false";
  const concept = getHomepageMotion(settings);

  const { ref } = useMotionReveal(concept);

  if (!visible) return null;

  const items: Array<{ title: string; desc: string; text: string; href: string; thumb?: string; videoId?: string }> =
    portfolios.length >= 2
      ? portfolios.slice(0, 2).map((p) => ({
          title: p.title,
          desc: p.description || "",
          text: "Khám phá →",
          href: `/san-pham/${p.id}`,
          thumb: p.thumbnailUrl,
          videoId: p.youtubeVideoId,
        }))
      : [
          {
            title: settings.home_work_card1_title || "Dự án nổi bật",
            desc: settings.home_work_card1_desc || "Tổng hợp những video được đầu tư về hình ảnh và storytelling của Minh Travel, sản xuất cùng những nhãn hàng lớn như Honda, Sony, VTV...",
            text: settings.home_work_card1_link_text || "Khám phá →",
            href: settings.home_work_card1_href || "/san-pham",
          },
          {
            title: settings.home_work_card2_title || "Short Video",
            desc: settings.home_work_card2_desc || "Những video short trên tiktok và các nền tảng đạt hàng trăm triệu views giúp Minh Travel tiếp cận được lượng lớn khán giả tại Việt Nam",
            text: settings.home_work_card2_link_text || "Xem trên TikTok →",
            href: settings.home_work_card2_href || "https://www.tiktok.com/@minhtravel",
          },
        ];

  return (
    <section ref={ref} className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <div className={styles.grid}>
        {items.map((card, i) => (
          <a
            key={i}
            data-motion-item
            href={card.href}
            target={!card.href.startsWith("/") ? "_blank" : undefined}
            rel={!card.href.startsWith("/") ? "noopener noreferrer" : undefined}
            className={`${styles.card} ${i === 0 ? styles.left : styles.right}`}
          >
            {card.thumb && <img src={card.thumb} alt="" className={styles.cardBg} loading="lazy" />}
            <div className={styles.cardInner}>
              <h2 className={styles.cardTitle}>{card.title}</h2>
              <p className={styles.cardDesc}>{card.desc}</p>
              <span className={styles.cardLink}>{card.text}</span>
            </div>
            <div className={styles.cardGlow} />
          </a>
        ))}
      </div>
    </section>
  );
}
