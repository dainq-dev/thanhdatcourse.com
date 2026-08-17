import styles from "./skeletons.module.scss";

export function ListSkeleton({ count }: { count: number }) {
  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.listRow}>
          <div className={`${styles.skelBlock} ${styles.listThumb}`} />
          <div className={styles.listLines}>
            <div className={`${styles.skelBlock} ${styles.listLine}`} />
            <div className={`${styles.skelBlock} ${styles.listLine}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
