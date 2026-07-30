import styles from "./QuoteBlock.module.scss";

export function QuoteBlock({
  data,
}: {
  data: { text: string; author?: string; style: string; icon?: string | null };
}) {
  return (
    <blockquote className={[styles.root, styles[data.style] || ""].filter(Boolean).join(" ")}>
      {data.icon && <span className={styles.icon}>{data.icon}</span>}
      <p>{data.text}</p>
      {data.author && <cite className={styles.cite}>{data.author}</cite>}
    </blockquote>
  );
}
