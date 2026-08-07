"use client";

import type { ComponentType } from "react";
import styles from "./index.module.scss";

interface LessonItem {
  title: string;
  lessons: string[];
}

interface LessonAccordionSectionConfig {
  section_title?: string;
  side_image_url?: string;
  chapters?: LessonItem[];
}

export const LessonAccordionSection: ComponentType<{
  config: Record<string, unknown>;
}> = ({ config }) => {
  const c = config as LessonAccordionSectionConfig;
  const sectionTitle = c.section_title || "";
  const sideImageUrl = c.side_image_url || "";
  const chapters: LessonItem[] = Array.isArray(c.chapters) ? c.chapters : [];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {sectionTitle && <h2 className={styles.title}>{sectionTitle}</h2>}

        <div className={styles.layout}>
          {sideImageUrl && (
            <img
              className={styles.sideImage}
              src={sideImageUrl}
              alt={sectionTitle || "Lesson content"}
            />
          )}

          <div className={styles.accordion}>
            {chapters.map((chapter, idx) => (
              <details
                key={idx}
                className={styles.accordionItem}
                open={idx === 0}
              >
                <summary className={styles.summary}>
                  <span>{chapter.title}</span>
                </summary>
                {chapter.lessons && chapter.lessons.length > 0 && (
                  <div className={styles.body}>
                    {chapter.lessons.map((lesson, li) => (
                      <p key={li} className={styles.lessonItem}>
                        &ndash; {lesson}
                      </p>
                    ))}
                  </div>
                )}
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
