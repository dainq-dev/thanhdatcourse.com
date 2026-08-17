import Link from "next/link";
import styles from "@/app/(nguoi-dung)/san-pham/[id]/page.module.scss";
import type { PortfolioDetailProps } from "../types";

export function PortfolioDetail({ item }: PortfolioDetailProps) {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
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
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className={styles.heroImage}
          />
        ) : null}
        <div className={styles.heroContent}>
          <span className={styles.categoryBadge}>{item.category}</span>
          <h1 className={styles.heroTitle}>{item.title}</h1>
          {item.description && (
            <p className={styles.heroDesc}>{item.description}</p>
          )}
          <div className={styles.heroActions}>
            {item.youtubeVideoId && (
              <a
                href={`https://youtu.be/${item.youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaYoutube}
              >
                Xem trên YouTube
              </a>
            )}
            {item.fullVideoUrl && (
              <a
                href={item.fullVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
              >
                Xem video đầy đủ
              </a>
            )}
          </div>
          <Link href="/san-pham" className={styles.backLink}>
            Quay lại danh sách
          </Link>
        </div>
      </section>
    </div>
  );
}
