import styles from "./Divider.module.scss";

interface DividerProps {
  direction?: "vertical" | "horizontal";
  className?: string;
}

export function Divider({
  direction = "vertical",
  className = "",
}: DividerProps) {
  return (
    <div className={`${styles.divider} ${styles[direction]} ${className}`}>
      <span className={styles.line} />
    </div>
  );
}
