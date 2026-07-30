import styles from "./ArticleCard.module.scss";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  readTime: number;
  publishedAt: string;
  className?: string;
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  thumbnail,
  author,
  readTime,
  publishedAt,
  className = "",
}: ArticleCardProps) {
  return (
    <article className={`${styles.card} ${className}`}>
      <a href={`/bai-viet/${slug}`} className={styles.thumbnail}>
        <img src={thumbnail} alt={title} loading="lazy" />
      </a>
      <div className={styles.body}>
        <h3 className={styles.title}>
          <a href={`/bai-viet/${slug}`}>{title}</a>
        </h3>
        <p className={styles.excerpt}>{excerpt}</p>
        <div className={styles.meta}>
          <span>{author}</span>
          <span>·</span>
          <span className={styles.readTime}>📖 {readTime} phút đọc</span>
          <span>·</span>
          <span>{publishedAt}</span>
        </div>
      </div>
    </article>
  );
}
