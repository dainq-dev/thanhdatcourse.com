import { formatVND } from "../lib/format";
import styles from "./PresetCard.module.scss";

interface PresetCardProps {
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  tag?: string;
  className?: string;
}

export function PresetCard({
  name,
  description,
  price,
  thumbnail,
  tag,
  className = "",
}: PresetCardProps) {
  return (
    <article className={`${styles.card} ${className}`}>
      <div className={styles.thumbnail} style={{ position: "relative" }}>
        <img src={thumbnail} alt={name} loading="lazy" />
        {tag && <span className={styles.tag}>{tag}</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>
          <span>{name}</span>
          <span className={styles.price}>{formatVND(price)}</span>
        </div>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  );
}
