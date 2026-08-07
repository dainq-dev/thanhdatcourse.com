import styles from "./index.module.scss";

interface RichTextConfig {
  title?: string;
  content_html?: string;
  background?: "white" | "soft";
}

function toHtml(raw: string) {
  return { __html: raw };
}

export default function RichTextSection({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const cfg = config as unknown as RichTextConfig;
  const title = cfg.title ?? "";
  const contentHtml = cfg.content_html ?? "";
  const bg = cfg.background ?? "white";

  return (
    <section
      className={bg === "soft" ? styles.sectionSoft : styles.sectionWhite}
    >
      <div className={styles.container}>
        <div className={styles.block}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
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
