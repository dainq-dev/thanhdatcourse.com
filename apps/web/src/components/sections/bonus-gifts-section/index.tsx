import styles from "./index.module.scss";

interface BonusItem {
  title: string;
  title_highlight: string;
  description_html: string;
  image_url: string;
  strikethrough_price: string;
}

interface BonusGiftsConfig {
  section_title?: string;
  items?: BonusItem[];
}

function toHtml(raw: string) {
  return { __html: raw };
}

function highlightPink(text: string, highlight: string) {
  if (!highlight) return text;
  const idx = text.indexOf(highlight);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className={styles.pink}>{highlight}</span>
      {text.slice(idx + highlight.length)}
    </>
  );
}

export default function BonusGiftsSection({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const cfg = config as unknown as BonusGiftsConfig;
  const title = cfg.section_title ?? "";
  const items: BonusItem[] = Array.isArray(cfg.items) ? cfg.items : [];

  if (!items.length) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.heading}>{title}</h2>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {title ? (
          <h2 className={styles.heading}>
            {(() => {
              const idx = title.indexOf("ưu đãi");
              if (idx === -1) return title;
              return (
                <>
                  {title.slice(0, idx)}
                  <span className={styles.pink}>ưu đãi</span>
                  {title.slice(idx + 5)}
                </>
              );
            })()}
          </h2>
        ) : null}

        {items.map((item, i) => {
          const num = String(i + 1).padStart(2, "0");
          const isEven = i % 2 !== 0;
          const textCol = (
            <div className={styles.textCol} key={`t-${i}`}>
              <p className={styles.index}>{num}</p>
              <h3 className={styles.itemTitle}>
                {highlightPink(item.title, item.title_highlight)}
              </h3>
              {item.strikethrough_price ? (
                <s className={styles.strikethrough}>
                  {item.strikethrough_price}
                </s>
              ) : null}
              {item.description_html ? (
                <div
                  className={styles.desc}
                  dangerouslySetInnerHTML={toHtml(item.description_html)}
                />
              ) : null}
            </div>
          );
          const imgCol = (
            <div className={styles.imgCol} key={`i-${i}`}>
              <img
                src={item.image_url}
                alt={item.title}
                className={styles.image}
                loading="lazy"
              />
            </div>
          );

          return (
            <div className={styles.row} key={i}>
              {isEven ? [imgCol, textCol] : [textCol, imgCol]}
            </div>
          );
        })}
      </div>
    </section>
  );
}
