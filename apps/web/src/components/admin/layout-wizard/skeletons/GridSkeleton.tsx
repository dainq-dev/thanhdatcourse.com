import styles from "./skeletons.module.scss";

export function GridSkeleton({ columns, rows }: { columns: number; rows: number }) {
  const cells = Array.from({ length: columns * rows }, (_, i) => i);
  return (
    <div
      className={styles.gridSkeleton}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {cells.map((i) => (
        <div key={i} className={`${styles.skelBlock} ${styles.gridCell}`} />
      ))}
    </div>
  );
}
