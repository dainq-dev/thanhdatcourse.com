import styles from "./index.module.scss";

interface SalesStoryConfig {
  title?: string;
  content_html?: string;
  image_left_url?: string;
  image_right_url?: string;
  background?: "white" | "soft";
}

function toHtml(raw: string) {
  return { __html: raw };
}

export default function SalesStorySection({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const cfg = config as unknown as SalesStoryConfig;
  const title = cfg.title ?? "";
  const contentHtml = cfg.content_html ?? "";
  const imgLeft = cfg.image_left_url ?? "";
  const imgRight = cfg.image_right_url ?? "";
  const bg = cfg.background ?? "white";
  const hasImages = imgLeft || imgRight;

  return (
    <section className={bg === "soft" ? styles.sectionSoft : styles.section}>
      <div className={styles.container}>
        <div className={styles.block}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}

          {hasImages ? (
            <div className={styles.imageGrid}>
              {imgLeft ? (
                <img
                  src={imgLeft}
                  alt=""
                  className={styles.storyImage}
                  loading="lazy"
                />
              ) : (
                <div />
              )}
              {imgRight ? (
                <img
                  src={imgRight}
                  alt=""
                  className={styles.storyImage}
                  loading="lazy"
                />
              ) : (
                <div />
              )}
            </div>
          ) : null}

          {contentHtml ? (
            <div
              className={styles.content}
              dangerouslySetInnerHTML={toHtml(contentHtml)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
