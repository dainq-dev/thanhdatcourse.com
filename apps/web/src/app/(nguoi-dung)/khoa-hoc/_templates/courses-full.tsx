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

export function CoursesFull({ settings, courses, faqs, engine }: Props) {
  const heroTitle =
    settings.courses_page_hero_title || "Bắt đầu sự nghiệp của bạn";
  const trustText =
    settings.courses_page_trust_text || "Được tin tưởng bởi 3,600+ thành viên";
  const faqHeading = settings.courses_page_faq_heading || "FAQ";
  const trustIconUrl = settings.courses_page_trust_icon_url || "";
  const ctaHeading = settings.courses_page_cta_heading || "Sẵn sàng bắt đầu?";
  const ctaBtnText = settings.courses_page_cta_btn_text || "Xem khóa học";
  const ctaBtnHref = settings.courses_page_cta_btn_href || "/khoa-hoc";

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

      <section className={styles.brandSection}>
        <h2 className={styles.brandTitle}>
          Một số thương hiệu tôi vinh dự được hợp tác
        </h2>
        <div className={styles.brandGrid}>
          <span>SONY</span>
          <span>CANON</span>
          <span>DJI</span>
          <span>FUJIFILM</span>
          <span>SAMSUNG</span>
          <span>XIAOMI</span>
          <span>OPPO</span>
          <span>VTV</span>
        </div>
      </section>

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

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>{ctaHeading}</h2>
        <div className={styles.ctaRow}>
          <a href={ctaBtnHref} className={styles.ctaPrimary}>
            {ctaBtnText}
          </a>
        </div>
      </section>
    </div>
  );
}
