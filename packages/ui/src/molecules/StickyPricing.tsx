import { Button } from '../atoms/Button';
import { formatVND } from '../lib/format';
import styles from './StickyPricing.module.scss';

interface StickyPricingProps {
  price: number;
  originalPrice?: number;
  features?: string[];
  className?: string;
}

export function StickyPricing({
  price,
  originalPrice,
  features = [],
  className = '',
}: StickyPricingProps) {
  const savings = originalPrice ? originalPrice - price : 0;

  return (
    <aside className={`${styles.stickyBox} ${className}`}>
      <div className={styles.priceSection}>
        <div className={styles.currentPrice}>{formatVND(price)}</div>
        {originalPrice && (
          <div className={styles.originalPrice}>{formatVND(originalPrice)}</div>
        )}
        {savings > 0 && (
          <div className={styles.savings}>Tiết kiệm {formatVND(savings)}</div>
        )}
      </div>
      <Button variant="primary" size="lg" as="a" href="#register" className={styles.cta}>
        Đăng ký ngay
      </Button>
      {features.length > 0 && (
        <ul className={styles.features}>
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}
