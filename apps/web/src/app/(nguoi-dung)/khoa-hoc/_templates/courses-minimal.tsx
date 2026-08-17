import { Accordion } from "@workspace/ui";
import { CourseGrid, CourseList } from "./course-cards";
import type { Course } from "./course-cards";
import styles from "../page.module.scss";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  settings: Record<string, string>;
  courses: Course[];
  faqs: FAQ[];
  engine?: string;
}

export function CoursesMinimal({ settings, courses, faqs, engine }: Props) {
  const heroTitle =
    settings.courses_page_hero_title || "Bắt đầu sự nghiệp của bạn";
  const trustText =
    settings.courses_page_trust_text || "Được tin tưởng bởi 3,600+ thành viên";
  const faqHeading = settings.courses_page_faq_heading || "FAQ";
  const trustIconUrl = settings.courses_page_trust_icon_url || "";

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            <p className={styles.heroTrust}>
              {trustIconUrl && (
                <img
                  src={trustIconUrl}
                  alt="trusted"
                  className={styles.trustIcon}
                />
              )}
              {trustText}
            </p>
          </div>
        </div>
      </section>

      {engine === "list" ? (
        <CourseList courses={courses} settings={settings} engine={engine} />
      ) : (
        <CourseGrid courses={courses} settings={settings} engine={engine} />
      )}

      <section className={styles.faqSection}>
        <h2>{faqHeading}</h2>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <Accordion key={faq.id} title={faq.question}>
              {faq.answer}
            </Accordion>
          ))}
        </div>
      </section>
    </div>
  );
}
