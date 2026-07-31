import { Accordion, PageHeader } from "@workspace/ui";
import type { Metadata } from "next";
import { StaggerReveal } from "@/components/sections/stagger-reveal";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import styles from "./page.module.scss";

interface Course {
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
}

async function getCourses(): Promise<Course[]> {
  try {
    return await api.fetchData<Course>("/api/courses?published=true", {
      next: { revalidate: 60 },
    });
  } catch {
    return [];
  }
}

async function getFAQs(): Promise<FAQ[]> {
  try {
    return await api.fetchData<FAQ>("/api/faqs", {
      next: { revalidate: 300 },
    });
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Khóa học",
  description:
    "Danh sách khóa học quay dựng, chỉnh màu chuyên nghiệp từ Minh Travel.",
};

export default async function CoursesPage() {
  const [courses, faqs, settings] = await Promise.all([
    getCourses(),
    getFAQs(),
    getSiteSettings(),
  ]);

  const heroTitle =
    settings.courses_page_hero_title || "Bắt đầu sự nghiệp của bạn";
  const trustText =
    settings.courses_page_trust_text || "Được tin tưởng bởi 3,600+ thành viên";
  const faqHeading = settings.courses_page_faq_heading || "FAQ";
  const defaultBtnText = settings.courses_page_default_btn_text || "Mua ngay";
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

      <div className={styles.courseSection}>
        <StaggerReveal staggerAmount={0.06}>
          <div className={styles.courseGrid}>
            {courses.map((course) => (
              <div key={course.id} className={styles.card} data-reveal>
                <a
                  href={`/khoa-hoc/${course.slug}`}
                  className={styles.cardThumb}
                >
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
        </StaggerReveal>
      </div>

      <section className={styles.faqSection}>
        <h1>{faqHeading}</h1>
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
