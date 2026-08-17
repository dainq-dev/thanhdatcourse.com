import { Accordion } from "@workspace/ui";
import { courseThumb } from "../shared/thumb";
import styles from "./styles.module.scss";
import type { CourseListProps } from "../types";

export function CourseList({ settings, courses, faqs }: CourseListProps) {
  const heroTitle =
    settings.courses_page_hero_title || "Bắt đầu sự nghiệp của bạn";
  const faqHeading = settings.courses_page_faq_heading || "FAQ";

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroLabel}>Khóa học</span>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          <p className={styles.heroTagline}>
            {settings.courses_page_trust_text ||
              "Được tin tưởng bởi 3,600+ thành viên"}
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <span className={styles.sectionLabel}>Danh sách</span>
          {courses.map((course) => (
            <a
              key={course.id}
              href={`/khoa-hoc/${course.slug}`}
              className={styles.courseRow}
            >
              <img
                src={courseThumb(course)}
                alt={course.title}
                className={styles.courseThumb}
              />
              <div>
                <h2 className={styles.courseTitle}>{course.title}</h2>
                <p className={styles.courseDesc}>{course.description}</p>
              </div>
              <span className={styles.coursePrice}>
                {course.basePrice.toLocaleString("vi-VN")}đ
              </span>
            </a>
          ))}
          {courses.length === 0 && (
            <p className={styles.empty}>Chưa có khóa học nào</p>
          )}
        </div>
      </section>

      {faqs.length > 0 && (
        <section className={styles.section}>
          <div className={`${styles.container} ${styles.faqList}`}>
            <span className={styles.sectionLabel}>Hỏi & Đáp</span>
            <h2 className={styles.sectionHeading}>{faqHeading}</h2>
            {faqs.map((faq) => (
              <Accordion key={faq.id} title={faq.question}>
                {faq.answer}
              </Accordion>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
