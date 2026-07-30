import styles from "./QuoteBlock.module.scss";

export function QuoteBlock({
  data,
}: {
  data: { text: string; author?: string; style: string };
}) {
  return (
    <blockquote
      className={[styles.root, styles[data.style] || ""]
        .filter(Boolean)
        .join(" ")}
    >
      <p>{data.text}</p>
      {data.author && <cite className={styles.cite}>{data.author}</cite>}
    </blockquote>
  );
}
