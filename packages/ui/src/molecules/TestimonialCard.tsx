import styles from './TestimonialCard.module.scss';

interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
  className?: string;
}

export function TestimonialCard({
  name,
  role,
  quote,
  avatar,
  className = '',
}: TestimonialCardProps) {
  return (
    <figure className={`${styles.card} ${className}`}>
      <div className={styles.avatar}>
        {avatar ? <img src={avatar} alt={name} loading="lazy" /> : name.charAt(0)}
      </div>
      <blockquote className={styles.quote}>"{quote}"</blockquote>
      <figcaption>
        <div className={styles.name}>{name}</div>
        <div className={styles.role}>{role}</div>
      </figcaption>
    </figure>
  );
}
