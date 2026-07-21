import { formatVND } from '../lib/format';
import styles from './CourseCard.module.scss';

interface CourseCardProps {
  slug: string;
  title: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  ratingCount?: string;
  studentCount?: number;
  isFeatured?: boolean;
  externalCheckoutUrl?: string;
  isComboOnly?: boolean;
  buttonText?: string;
  className?: string;
}

export function CourseCard({
  slug,
  title,
  thumbnail,
  price,
  originalPrice,
  ratingCount,
  studentCount,
  isFeatured,
  externalCheckoutUrl,
  isComboOnly,
  buttonText,
  className = '',
}: CourseCardProps) {
  const checkoutUrl = externalCheckoutUrl || `https://go.minhtravel.vn/checkouts/${slug}/`;
  const btnText = buttonText || 'Mua ngay';
  const isDisabled = !!isComboOnly;

  return (
    <article className={`${styles.card} ${className}`}>
      <a href={`/khoa-hoc/${slug}`} className={styles.thumbnail}>
        <img src={thumbnail} alt={title} loading="lazy" />
      </a>
      <div className={styles.body}>
        {ratingCount && (
          <span className={styles.rating}>{ratingCount} Đánh giá</span>
        )}
        <h3 className={styles.title}>
          <a href={`/khoa-hoc/${slug}`}>{title}</a>
        </h3>
        <p className={styles.excerpt} />
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatVND(price)}</span>
          {originalPrice && (
            <span className={styles.originalPrice}>{formatVND(originalPrice)}</span>
          )}
        </div>
        {isDisabled ? (
          <span className={`${styles.buyBtn} ${styles.disabled}`}>{btnText}</span>
        ) : (
          <a
            href={checkoutUrl}
            className={styles.buyBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            {btnText}
          </a>
        )}
      </div>
    </article>
  );
}
