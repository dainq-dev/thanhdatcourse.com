import styles from "./skeletons.module.scss";

export function TimelineSkeleton() {
  return (
    <div className={styles.timelineSkeleton}>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i}>
          {i > 0 && <div className={styles.timelineConnector} />}
          <div className={styles.timelineItem}>
            <div className={`${styles.skelBlock} ${styles.timelineDot}`} />
            <div className={styles.timelineContent}>
              <div className={`${styles.skelBlock} ${styles.timelineBar}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
