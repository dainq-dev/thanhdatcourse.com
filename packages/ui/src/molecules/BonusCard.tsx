import styles from './BonusCard.module.scss';

interface BonusCardProps {
  name: string;
  value: string;
  icon?: string;
  className?: string;
}

export function BonusCard({ name, value, icon, className = '' }: BonusCardProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      <span className={styles.icon}>{icon || '🎁'}</span>
      <div>
        <div className={styles.name}>{name}</div>
        <div className={styles.value}>Trị giá {value}</div>
      </div>
    </div>
  );
}
