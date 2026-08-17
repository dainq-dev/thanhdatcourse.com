import { MotionReveal } from "@/components/sections/motion-reveal";
import { getMotionConcept } from "@/lib/motion";
import styles from "../page.module.scss";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  ratingCount?: string;
  externalCheckoutUrl?: string;
  isComboOnly?: number;
  buttonText?: string;
}

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
}

interface Props {
  courses: Course[];
  settings: Record<string, string>;
  engine?: string;
}

export function CourseGrid({ courses, settings, engine }: Props) {
  const defaultBtnText = settings.courses_page_default_btn_text || "Mua ngay";
  const concept = getMotionConcept(engine, "courses", "cascade");
  return (
    <div className={styles.courseSection}>
      <MotionReveal concept={concept}>
        <div className={styles.courseGrid}>
          {courses.map((course) => (
            <div key={course.id} className={styles.card} data-motion-item>
              <a href={`/khoa-hoc/${course.slug}`} className={styles.cardThumb}>
                <img
                  src={course.thumbnailUrl || "/placeholder-course.jpg"}
                  alt={course.title}
                  loading="lazy"
                />
              </a>
              <div className={styles.cardBody}>
                {course.ratingCount && (
                  <div className={styles.cardRating}>
                    {course.ratingCount} Đánh giá
                  </div>
                )}
                <h3 className={styles.cardTitle}>{course.title}</h3>
                <p className={styles.cardDesc}>{course.description}</p>
                <div className={styles.cardPrice}>
                  {formatPrice(course.basePrice)}
                </div>
                <div className={styles.cardBtnRow}>
                  {course.buttonText === "Không Bán Rời" ? (
                    <span className={styles.btnDisabled}>Không Bán Rời</span>
                  ) : (
                    <a
                      href={
                        course.externalCheckoutUrl ||
                        `https://go.minhtravel.vn/checkouts/${course.slug}/`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnBuy}
                    >
                      {course.buttonText || defaultBtnText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </MotionReveal>
    </div>
  );
}

export function CourseList({ courses, settings, engine }: Props) {
  const defaultBtnText = settings.courses_page_default_btn_text || "Mua ngay";
  const concept = getMotionConcept(engine, "courses", "slide");
  return (
    <div className={styles.courseSection}>
      <MotionReveal concept={concept}>
        <div className={styles.listContainer}>
          {courses.map((course) => (
            <div key={course.id} className={styles.listRow} data-motion-item>
              <a href={`/khoa-hoc/${course.slug}`} className={styles.listThumb}>
                <img
                  src={course.thumbnailUrl || "/placeholder-course.jpg"}
                  alt={course.title}
                  loading="lazy"
                />
              </a>
              <div className={styles.listInfo}>
                {course.ratingCount && (
                  <div className={styles.cardRating}>
                    {course.ratingCount} Đánh giá
                  </div>
                )}
                <h3 className={styles.cardTitle}>{course.title}</h3>
                <p className={styles.cardDesc}>{course.description}</p>
                <div className={styles.listBottom}>
                  <div className={styles.cardPrice}>
                    {formatPrice(course.basePrice)}
                  </div>
                  {course.buttonText === "Không Bán Rời" ? (
                    <span className={styles.btnDisabled}>Không Bán Rời</span>
                  ) : (
                    <a
                      href={
                        course.externalCheckoutUrl ||
                        `https://go.minhtravel.vn/checkouts/${course.slug}/`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnBuy}
                    >
                      {course.buttonText || defaultBtnText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </MotionReveal>
    </div>
  );
}
