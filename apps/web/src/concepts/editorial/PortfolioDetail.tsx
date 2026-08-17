import Link from "next/link";
import styles from "./styles.module.scss";
import type { PortfolioDetailProps } from "../types";

export function PortfolioDetail({ item }: PortfolioDetailProps) {
  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{item.category}</span>
          <h1 className={styles.heroTitle}>{item.title}</h1>
          {item.description && (
            <p className={styles.heroLead}>{item.description}</p>
          )}
          <div className={styles.heroActions}>
            {item.youtubeVideoId && (
              <a
                href={`https://youtu.be/${item.youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkPrimary}
              >
                Xem trên YouTube
              </a>
            )}
            <Link href="/san-pham" className={styles.linkSecondary}>
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </header>

      {item.youtubeVideoId && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.videoWrapper}>
              <iframe
                className={styles.videoFrame}
                src={`https://www.youtube.com/embed/${item.youtubeVideoId}`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
