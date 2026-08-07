import styles from "./index.module.scss";

interface FaqItem {
  question: string;
  answer_html: string;
}

interface FaqAccordionConfig {
  title?: string;
  items?: FaqItem[];
}

function toHtml(raw: string) {
  return { __html: raw };
}

export default function FaqAccordionSection({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const cfg = config as unknown as FaqAccordionConfig;
  const title = cfg.title ?? "FAQ";
  const items: FaqItem[] = Array.isArray(cfg.items) ? cfg.items : [];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {title ? <h2 className={styles.heading}>{title}</h2> : null}

        {items.length > 0 ? (
          <div className={styles.accordion}>
            {items.map((item, i) => (
              <details className={styles.item} key={i}>
                <summary className={styles.summary}>
                  <span>
                    {i + 1}. {item.question}
                  </span>
                  <span className={styles.arrow}>&#9660;</span>
                </summary>
                <div
                  className={styles.answer}
                  dangerouslySetInnerHTML={toHtml(item.answer_html)}
                />
              </details>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
