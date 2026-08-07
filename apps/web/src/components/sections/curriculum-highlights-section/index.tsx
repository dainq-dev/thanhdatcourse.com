"use client";

import type { ComponentType } from "react";
import styles from "./index.module.scss";

interface CurriculumItem {
  number: number;
  title: string;
  description_html: string;
  image_url: string;
}

interface CurriculumHighlightsSectionConfig {
  section_title?: string;
  section_subtitle?: string;
  section_subtitle_highlight?: string;
  items?: CurriculumItem[];
}

export const CurriculumHighlightsSection: ComponentType<{
  config: Record<string, unknown>;
}> = ({ config }) => {
  const c = config as CurriculumHighlightsSectionConfig;
  const sectionTitle = c.section_title || "";
  const sectionSubtitle = c.section_subtitle || "";
  const highlight = c.section_subtitle_highlight || "";
  const items: CurriculumItem[] = Array.isArray(c.items) ? c.items : [];

  const renderSubtitle = () => {
    if (!sectionSubtitle) return null;
    if (highlight && sectionSubtitle.includes(highlight)) {
      const parts = sectionSubtitle.split(highlight);
      return (
        <h2 className={styles.subtitle}>
          {parts[0]}
          <span className={styles.pink}>{highlight}</span>
          {parts.slice(1).join(highlight)}
        </h2>
      );
    }
    return <h2 className={styles.subtitle}>{sectionSubtitle}</h2>;
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.intro}>
          {sectionTitle && <h2 className={styles.title}>{sectionTitle}</h2>}
          {renderSubtitle()}
        </div>

        {items.map((item, idx) => (
          <article key={idx} className={styles.item}>
            <div className={styles.textCol}>
              <p className={styles.numBadge}>#{item.number}</p>
              {item.title && <h3 className={styles.itemTitle}>{item.title}</h3>}
              {item.description_html && (
                <div
                  className={styles.description}
                  dangerouslySetInnerHTML={{ __html: item.description_html }}
                />
              )}
            </div>
            {item.image_url && (
              <img
                className={styles.itemImage}
                src={item.image_url}
                alt={item.title || ""}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
