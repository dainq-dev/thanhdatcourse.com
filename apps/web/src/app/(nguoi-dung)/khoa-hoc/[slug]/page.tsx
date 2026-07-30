import { Accordion } from "@workspace/ui";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getSiteSettings, parseSetting } from "@/lib/settings";
import styles from "./page.module.scss";
import { CourseStickyCTA } from "./StickyCTA";

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  basePrice: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  externalCheckoutUrl?: string;
  isComboOnly?: number;
  buttonText?: string;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  sortOrder: number;
}

interface Testimonial {
  id: string;
  userName: string;
  title?: string;
  content: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Bonus {
  id: string;
  name: string;
  value: string;
  sortOrder: number;
}

interface Promotion {
  id: string;
  campaignName: string;
  discountPercentage: number;
}

async function getCourse(slug: string): Promise<Course | null> {
  try {
    const res = await api.fetch(`/api/courses/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    const json = await res.json();
    return json.data || json;
  } catch { return null; }
}

async function getModules(courseId: string): Promise<Module[]> {
  try {
    const res = await api.fetch(`/api/courses/${courseId}/modules`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.data || json;
  } catch { return []; }
}

async function getBonuses(courseId: string): Promise<Bonus[]> {
  try {
    const res = await api.fetch(`/api/courses/${courseId}/bonuses`, {
      next: { revalidate: 60 },
    });
    return res.json();
  } catch {
    return [];
  }
}

async function getTestimonials(courseId: string): Promise<Testimonial[]> {
  try {
    const res = await api.fetch(`/api/testimonials?course_id=${courseId}`, {
      next: { revalidate: 60 },
    });
    return res.json();
  } catch {
    return [];
  }
}

async function getFAQs(courseId: string): Promise<FAQ[]> {
  try {
    const courseFaqs = await api
      .fetch(`/api/faqs?course_id=${courseId}`, { next: { revalidate: 60 } })
      .then((r) => r.json());
    const globalFaqs = await api
      .fetch("/api/faqs", { next: { revalidate: 60 } })
      .then((r) => r.json());
    return [
      ...(Array.isArray(courseFaqs) ? courseFaqs : []),
      ...(Array.isArray(globalFaqs) ? globalFaqs : []),
    ];
  } catch {
    return [];
  }
}

async function getPromotion(courseId: string): Promise<Promotion | null> {
  try {
    const res = await api.fetch(
      `/api/promotions/active?course_id=${courseId}`,
      { next: { revalidate: 60 } },
    );
    const text = await res.text();
    if (!text || text === "null") return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const course = await getCourse(params.slug);
  if (!course) return { title: "Không tìm thấy" };
  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getCourse(params.slug);
  if (!course) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Không tìm thấy khóa học</h1>
        <p className={styles.notFoundDesc}>
          Khóa học bạn đang tìm không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    );
  }

  const [modules, bonuses, testimonials, faqs, settings, promotion] =
    await Promise.all([
      getModules(course.id),
      getBonuses(course.id),
      getTestimonials(course.id),
      getFAQs(course.id),
      getSiteSettings(),
      getPromotion(course.id),
    ]);

  const formattedPrice = new Intl.NumberFormat("vi-VN").format(
    course.basePrice,
  );
  const checkoutUrl =
    course.externalCheckoutUrl ||
    `https://go.minhtravel.vn/checkouts/${course.slug}/`;
  const isComboOnly = course.isComboOnly === 1;

  const heroBadgeText = promotion
    ? `ƯU ĐÃI GIẢM GIÁ ${promotion.discountPercentage}%`
    : null;

  const heroSubtitle =
    settings.course_detail_hero_subtitle ||
    settings.hero_subtitle ||
    "TIẾT LỘ BÍ QUYẾT TẠO RA HÀNG LOẠT VIDEO TRIỆU VIEW";

  const brands: { name: string }[] = parseSetting(settings, "hero_brands", []);
  const targetBadges: string[] = parseSetting(
    settings,
    "course_target_badges",
    [],
  );
  const modulesSectionTitle =
    settings.course_detail_modules_title ||
    "Thành Thạo Quay dựng Triệu View Bằng Điện Thoại Dễ Dàng!";
  const modulesSectionSubtitle =
    settings.course_detail_modules_subtitle ||
    "Đây là một vài kiến thức giá trị mà bạn sẽ được học trong khoá học!";
  const bonusesTitle =
    settings.course_detail_bonuses_title ||
    "Đây là các ưu đãi bạn sẽ nhận được khi đăng ký khoá học...";
  const testimonialsTitle =
    settings.course_detail_testimonials_title || "Feedback khoá học";

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          {heroBadgeText && (
            <div className={styles.heroBadge}>{heroBadgeText}</div>
          )}
          <p className={styles.heroSubtitle}>{heroSubtitle}</p>
          <h1 className={styles.heroTitle}>{course.title}</h1>
          <p className={styles.heroDesc}>{course.description}</p>
          <div>
            {isComboOnly ? (
              <span className={styles.heroCtaOutline}>
                {course.buttonText || "Không Bán Rời"}
              </span>
            ) : (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.heroCta}
              >
                {course.buttonText || "ĐĂNG KÝ NGAY!"}
              </a>
            )}
          </div>
        </div>
      </section>

      {brands.length > 0 && (
        <section className={styles.brandSection}>
          <h2 className={styles.brandTitle}>
            Một số thương hiệu tôi vinh dự được hợp tác
          </h2>
          <div className={styles.brandGrid}>
            {brands.map((brand) => (
              <span key={brand.name}>{brand.name}</span>
            ))}
          </div>
        </section>
      )}

      {targetBadges.length > 0 && (
        <section className={styles.targetBadges}>
          {targetBadges.map((badge) => (
            <div key={badge} className={styles.targetBadge}>
              {badge}
            </div>
          ))}
        </section>
      )}

      {modules.length > 0 && (
        <section className={styles.modulesSection}>
          <h2 className={styles.modulesTitle}>{modulesSectionTitle}</h2>
          <p className={styles.modulesSubtitle}>{modulesSectionSubtitle}</p>
          <div className={styles.moduleList}>
            {modules.map((mod, idx) => (
              <div key={mod.id} className={styles.moduleItem}>
                <span className={styles.moduleNum}>#{idx + 1}</span>
                <div>
                  <h3 className={styles.moduleTitle}>{mod.title}</h3>
                  {mod.description && (
                    <p className={styles.moduleDesc}>{mod.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {bonuses.length > 0 && (
        <div className={styles.bonusBg}>
          <section className={styles.bonusSection}>
            <h2 className={styles.bonusTitle}>{bonusesTitle}</h2>
            <div className={styles.bonusList}>
              {bonuses.map((bonus, idx) => (
                <div key={bonus.id} className={styles.bonusItem}>
                  <span className={styles.bonusNum}>0{idx + 1}:</span>
                  <div>
                    <h3 className={styles.bonusName}>
                      {bonus.name} — {bonus.value}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {testimonials.length > 0 && (
        <section className={styles.testimonialsSection}>
          <h2 className={styles.testimonialsTitle}>{testimonialsTitle}</h2>
          <div className={styles.testimonialGrid}>
            {testimonials.map((t) => (
              <div key={t.id} className={styles.testimonialCard}>
                <h3 className={styles.testimonialTitle}>
                  {t.title || t.userName}
                </h3>
                <p className={styles.testimonialQuote}>{t.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className={styles.faqSection}>
          <h1 className={styles.faqWatermark}>FAQ</h1>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <Accordion key={faq.id} title={faq.question}>
                {faq.answer}
              </Accordion>
            ))}
          </div>
        </section>
      )}

      <CourseStickyCTA price={formattedPrice} checkoutUrl={checkoutUrl} />
    </div>
  );
}
