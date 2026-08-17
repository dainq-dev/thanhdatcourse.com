import styles from "./styles.module.scss";
import type { CourseListProps } from "../types";

export function CourseList({ settings, courses }: CourseListProps) {
  const heroTitle =
    settings.courses_page_hero_title || "Bắt đầu sự nghiệp của bạn";

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Khóa học</span>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          <p className={styles.heroLead}>
            {settings.courses_page_trust_text ||
              "Được tin tưởng bởi 3,600+ thành viên"}
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIndex}>Danh sách</span>
            <h2 className={styles.sectionTitle}>Tất cả khóa học</h2>
          </div>
          {courses.map((course) => (
            <a
              key={course.id}
              href={`/khoa-hoc/${course.slug}`}
              className={styles.listRow}
            >
              <div>
                <h3 className={styles.listTitle}>{course.title}</h3>
                <p className={styles.listDesc}>{course.description}</p>
              </div>
              <span className={styles.listMeta}>
                {course.basePrice.toLocaleString("vi-VN")}đ
              </span>
            </a>
          ))}
          {courses.length === 0 && (
            <p className={styles.empty}>Chưa có khóa học nào</p>
          )}
        </div>
      </section>
    </div>
  );
}
