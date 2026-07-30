import styles from "./CalloutBlock.module.scss";

export function CalloutBlock({
  data,
}: {
  data: { text: string; variant: string; icon?: string };
}) {
  return (
    <div
      className={[styles.root, styles[data.variant] || ""]
        .filter(Boolean)
        .join(" ")}
    >
      {data.icon && <span className={styles.icon}>{data.icon}</span>}
      {data.text}
    </div>
  );
}
