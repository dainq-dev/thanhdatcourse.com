import styles from "./index.module.scss";

interface StatItem {
  value: string;
  label: string;
}

interface BrandItem {
  image_url: string;
  alt: string;
}

interface InstructorJourneyConfig {
  portrait_url?: string;
  title?: string;
  stats?: StatItem[];
  story_html?: string;
  cta_text?: string;
  cta_url?: string;
  brand_strip?: BrandItem[];
  background?: "white" | "soft";
}

function toHtml(raw: string) {
  return { __html: raw };
}

export default function InstructorJourneySection({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const cfg = config as unknown as InstructorJourneyConfig;
  const portraitUrl = cfg.portrait_url ?? "";
  const title = cfg.title ?? "";
  const stats: StatItem[] = Array.isArray(cfg.stats) ? cfg.stats : [];
  const storyHtml = cfg.story_html ?? "";
  const ctaText = cfg.cta_text ?? "ĐĂNG KÝ TẠI ĐÂY!";
  const ctaUrl = cfg.cta_url ?? "#";
  const brandStrip: BrandItem[] = Array.isArray(cfg.brand_strip)
    ? cfg.brand_strip
    : [];
  const bg = cfg.background ?? "white";

  return (
    <section className={bg === "soft" ? styles.sectionSoft : styles.section}>
      <div className={styles.container}>
        <div className={styles.journey}>
          {portraitUrl ? (
            <div className={styles.portraitCol}>
              <img
                src={portraitUrl}
                alt="Instructor portrait"
                className={styles.portrait}
                loading="lazy"
              />
            </div>
          ) : null}
          <div className={styles.contentCol}>
            {title ? <h2 className={styles.title}>{title}</h2> : null}

            {stats.length > 0 ? (
              <div className={styles.stats}>
                {stats.map((stat, i) => (
                  <div className={styles.stat} key={i}>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {storyHtml ? (
              <div
                className={styles.story}
                dangerouslySetInnerHTML={toHtml(storyHtml)}
              />
            ) : null}

            <details className={styles.accordion}>
              <summary className={styles.accordionSummary}>Đọc tiếp</summary>
              <div className={styles.accordionBody}>
                <p>
                  Gia đình mình biết được quyết định đó và đã phản đối. Bố mẹ
                  luôn mong muốn con cái có một công việc ổn định, không phải lo
                  nghĩ, bấp bênh.
                </p>
                <p>
                  Để theo đuổi đam mê, mình quyết định tự lo tiền ăn, tiền ở,
                  học phí…{" "}
                  <strong>
                    và cố gắng hết sức để kiếm thật nhiều tiền từ nghề làm phim.
                  </strong>
                </p>
                <p>
                  Khi có thể tự lo tốt cho bản thân thì gia đình sẽ hiểu và tin
                  tưởng vào quyết định của chúng ta.
                </p>
                <p>
                  <strong>Mình bắt đầu xây kênh Youtube</strong>, tự làm content
                  và lên chiến lược để phát triển kênh.
                </p>
                <p>
                  Nhờ vào việc có thương hiệu cá nhân mà mình nhận được nhiều
                  job hơn, các nhãn hàng máy ảnh cũng bắt đầu liên hệ để book
                  mình review thiết bị.
                </p>
                <p>
                  Cuối năm 2020, khi <strong>TikTok</strong> bắt đầu phát triển
                  ở Việt Nam. Mình đã nhận ra <strong>một cơ hội lớn</strong> và
                  dành 1 tuần liên tục để học về thuật toán của nền tảng.
                </p>
                <p>
                  Khi kênh TikTok khởi sắc với các video vài trăm ngàn tới vài
                  triệu view. Mình được rất nhiều nhãn hàng liên hệ booking.
                </p>
                <p>
                  Thu nhập của mình thời gian ấy{" "}
                  <strong>khoảng 100 triệu/tháng</strong>. Đến bây giờ thì con
                  số đó vẫn tiếp tục tăng lên.
                </p>
              </div>
            </details>

            <h3 className={styles.subHeading}>
              Thu nhập của mình đến từ 3 nguồn chính
            </h3>
            <p className={styles.incomeItem}>
              Nhận booking từ nhãn hàng: Sony, Canon, DJI, Samsung, Oppo,… và
              các hãng thiết bị làm phim khác.
            </p>
            <p className={styles.incomeItem}>
              Nhận quay MV ca nhạc, TVC quảng cáo cho các công ty.
            </p>
            <p className={styles.incomeItem}>
              Từ 2022, mình dành nhiều thời gian để tạo ra{" "}
              <strong>những khóa học online</strong>. Đây là nơi mình chia sẻ
              hết những kiến thức mình học được trong những năm qua mà không hề
              giấu diếm gì hết. Những khóa học cũng là một nguồn thu nhập thụ
              động nữa cho mình. Tuy nhiên mình luôn tin rằng{" "}
              <strong>giá trị mọi người nhận về sau khi học</strong> sẽ lớn hơn
              giá của khóa học rất nhiều!
            </p>

            {ctaUrl ? (
              <p>
                <a href={ctaUrl} className={styles.cta}>
                  {ctaText}
                </a>
              </p>
            ) : null}
          </div>
        </div>

        {brandStrip.length > 0 ? (
          <div className={styles.brandStrip}>
            {brandStrip.map((brand, i) => (
              <img
                key={i}
                src={brand.image_url}
                alt={brand.alt}
                className={styles.brandLogo}
                loading="lazy"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
