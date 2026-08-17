import styles from "./skeletons.module.scss";

export function CarouselSkeleton() {
  return (
    <div style={{ overflow: "hidden" }}>
      <div className={styles.carouselTrack}>
        <div className={`${styles.skelBlock} ${styles.carouselCard}`} />
        <div className={`${styles.skelBlock} ${styles.carouselCard}`} />
        <div className={`${styles.skelBlock} ${styles.carouselCard}`} />
        <div className={`${styles.skelBlock} ${styles.carouselCard}`} />
        <div className={`${styles.skelBlock} ${styles.carouselCard}`} />
      </div>
    </div>
  );
}
