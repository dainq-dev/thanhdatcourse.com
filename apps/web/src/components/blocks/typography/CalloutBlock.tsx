import styles from "./CalloutBlock.module.scss";

export function CalloutBlock({
  data,
}: {
  data: { text: string; variant: string; icon?: string | null; title?: string };
}) {
  return (
    <div className={[styles.root, styles[data.variant] || ""].filter(Boolean).join(" ")}>
      {data.icon && <span className={styles.icon}>{data.icon}</span>}
      {data.title && <div className={styles.title}>{data.title}</div>}
      {data.text && <div className={styles.text}>{data.text}</div>}
    </div>
  );
}
