import { courseThumb } from "../shared/thumb";
import styles from "./styles.module.scss";
import type { CourseListProps } from "../types";

export function CourseList({ settings, courses }: CourseListProps) {
  const heroTitle =
    settings.courses_page_hero_title || "Bắt đầu sự nghiệp của bạn";
  const heroTrust =
    settings.courses_page_trust_text || "Được tin tưởng bởi 3,600+ thành viên";

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          <p className={styles.heroSubtitle}>{heroTrust}</p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.bentoGrid}>
            {courses.map((course, i) => (
              <a
                key={course.id}
                href={`/khoa-hoc/${course.slug}`}
                className={`${styles.tile} ${
                  i === 0
                    ? styles.tileLg
                    : i % 3 === 0
                      ? styles.tileMd
                      : styles.tileSm
                }`}
              >
                <img
                  src={courseThumb(course)}
                  alt={course.title}
                  className={styles.tileImg}
                />
                <div className={styles.tileOverlay} />
                <div className={styles.tileContent}>
                  <span className={styles.tileLabel}>
                    {course.ratingCount
                      ? `${course.ratingCount} đánh giá`
                      : "Khóa học"}
                  </span>
                  <h2 className={styles.tileTitle}>{course.title}</h2>
                  <span className={styles.tilePrice}>
                    {course.basePrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </a>
            ))}
          </div>
          {courses.length === 0 && (
            <p className={styles.empty}>Chưa có khóa học nào</p>
          )}
        </div>
      </section>
    </div>
  );
}
