import styles from './PortfolioCard.module.scss';

interface PortfolioCardProps {
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  href?: string;
  className?: string;
}

export function PortfolioCard({
  title,
  description,
  thumbnail,
  category,
  href = '#',
  className = '',
}: PortfolioCardProps) {
  return (
    <article className={`${styles.card} ${className}`}>
      <a href={href} className={styles.thumbnail}>
        <img src={thumbnail} alt={title} loading="lazy" />
        <span className={styles.playIcon}>▶</span>
      </a>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  );
}
