import styles from "./skeletons.module.scss";

export function MasonrySkeleton() {
  return (
    <div className={styles.masonryGrid}>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className={`${styles.skelBlock} ${styles.masonryCell}`}
        />
      ))}
    </div>
  );
}
