import { courseThumb } from "../shared/thumb";
import styles from "./styles.module.scss";
import type { CourseListProps } from "../types";

export function CourseList({ settings, courses }: CourseListProps) {
  const heroTitle =
    settings.courses_page_hero_title || "Bắt đầu sự nghiệp của bạn";

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          <p className={styles.heroSubtitle}>
            {settings.courses_page_trust_text ||
              "Được tin tưởng bởi 3,600+ thành viên"}
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.masonry}>
            {courses.map((course) => (
              <a
                key={course.id}
                href={`/khoa-hoc/${course.slug}`}
                className={styles.masonryItem}
              >
                <div className={styles.card}>
                  <img
                    src={courseThumb(course)}
                    alt={course.title}
                    className={styles.cardImg}
                  />
                  <div className={styles.cardOverlay} />
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{course.title}</h3>
                    <span className={styles.cardMeta}>
                      {course.basePrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
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
