import { Button } from '../atoms/Button';
import styles from './HeroBanner.module.scss';

interface Stat {
  value: string;
  label: string;
}

interface HeroBannerProps {
  eyebrow?: string;
  heading: string;
  headingHighlight?: string;
  lead: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  stats?: Stat[];
  visual?: React.ReactNode;
  className?: string;
}

export function HeroBanner({
  eyebrow,
  heading,
  headingHighlight,
  lead,
  primaryCta,
  secondaryCta,
  stats,
  visual,
  className = '',
}: HeroBannerProps) {
  return (
    <section className={`${styles.hero} ${className}`}>
      <div className={styles.overlay} />
      <div className={styles.inner}>
        <div className={styles.content}>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1 className={styles.heading}>
            {heading}
            {headingHighlight && <em>{headingHighlight}</em>}
          </h1>
          <p className={styles.lead}>{lead}</p>
          <div className={styles.actions}>
            <Button variant="primary" size="lg" as="a" href={primaryCta.href}>
              {primaryCta.label}
            </Button>
            {secondaryCta && (
              <Button variant="outline" size="lg" as="a" href={secondaryCta.href}>
                {secondaryCta.label}
              </Button>
            )}
          </div>
          {stats && (
            <div className={styles.stats}>
              {stats.map((s) => (
                <div key={s.label} className={styles.stat}>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {visual && <div className={styles.visual}>{visual}</div>}
      </div>
    </section>
  );
}
