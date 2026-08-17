import Link from "next/link";
import styles from "./styles.module.scss";
import type { PortfolioDetailProps } from "../types";

export function PortfolioDetail({ item }: PortfolioDetailProps) {
  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{item.title}</h1>
          <p className={styles.heroSubtitle}>{item.category}</p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          {item.youtubeVideoId ? (
            <div className={styles.videoWrapper}>
              <iframe
                className={styles.videoFrame}
                src={`https://www.youtube.com/embed/${item.youtubeVideoId}`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : item.thumbnailUrl ? (
            <div className={styles.featuredFull}>
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className={styles.featuredImg}
              />
              <div className={styles.featuredOverlay} />
              <div className={styles.featuredBody}>
                <span className={styles.featuredTag}>{item.category}</span>
                <h2 className={styles.featuredTitle}>{item.title}</h2>
              </div>
            </div>
          ) : null}

          {item.description && (
            <p
              style={{
                color: "#9a9a9a",
                lineHeight: 1.7,
                marginTop: 24,
                maxWidth: "46rem",
              }}
            >
              {item.description}
            </p>
          )}

          <div className={styles.actionsRow}>
            {item.youtubeVideoId && (
              <a
                href={`https://youtu.be/${item.youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimary}
              >
                Xem trên YouTube
              </a>
            )}
            <Link href="/san-pham" className={styles.btnSecondary}>
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
