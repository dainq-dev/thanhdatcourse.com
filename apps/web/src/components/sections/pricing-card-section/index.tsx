import styles from "./index.module.scss";

interface Feature {
  text: string;
  bold: boolean;
}

interface PricingCardConfig {
  card_image_url?: string;
  title?: string;
  price_text?: string;
  features?: Feature[];
  cta_text?: string;
  cta_url?: string;
}

export default function PricingCardSection({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const cfg = config as unknown as PricingCardConfig;
  const imageUrl = cfg.card_image_url ?? "";
  const title = cfg.title ?? "";
  const priceText = cfg.price_text ?? "";
  const features: Feature[] = Array.isArray(cfg.features) ? cfg.features : [];
  const ctaText = cfg.cta_text ?? "ĐẶT MUA";
  const ctaUrl = cfg.cta_url ?? "#";

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "Pricing"}
              className={styles.cardImage}
              loading="lazy"
            />
          ) : null}
          <div className={styles.body}>
            {title ? <h3 className={styles.title}>{title}</h3> : null}
            {priceText ? <p className={styles.price}>{priceText}</p> : null}
            {features.length > 0 ? (
              <ul className={styles.features}>
                {features.map((f, i) => (
                  <li key={i} className={styles.featureItem}>
                    <span className={styles.checkmark}>&#10003;</span>
                    {f.bold ? (
                      <strong className={styles.featureBold}>{f.text}</strong>
                    ) : (
                      f.text
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
            {ctaUrl ? (
              <a href={ctaUrl} className={styles.cta}>
                {ctaText}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
