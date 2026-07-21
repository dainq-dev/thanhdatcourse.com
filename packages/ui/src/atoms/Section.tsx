import type { ReactNode } from 'react';
import styles from './Section.module.scss';

type SectionBg = 'white' | 'muted';

interface SectionProps {
  title?: string;
  subtitle?: string;
  bg?: SectionBg;
  children?: ReactNode;
  className?: string;
}

export function Section({
  title,
  subtitle,
  bg = 'white',
  children,
  className = '',
}: SectionProps) {
  return (
    <section
      className={`${styles.section} ${styles[`bg-${bg}`]} ${className}`}
    >
      <div className={styles.container}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
