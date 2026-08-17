"use client";

import { CarouselSkeleton } from "./CarouselSkeleton";
import { GridSkeleton } from "./GridSkeleton";
import { ListSkeleton } from "./ListSkeleton";
import { MasonrySkeleton } from "./MasonrySkeleton";
import { TimelineSkeleton } from "./TimelineSkeleton";
import styles from "./skeletons.module.scss";

interface Props {
  type: string;
  engine?: string;
  label: string;
  tone?: string;
}

function renderContentSkeleton(engine: string | undefined) {
  switch (engine) {
    case "carousel":
    case "filmstrip":
      return <CarouselSkeleton />;
    case "list":
    case "single-col":
      return <ListSkeleton count={3} />;
    case "masonry":
      return <MasonrySkeleton />;
    case "timeline":
      return <TimelineSkeleton />;
    case "stacked":
      return <ListSkeleton count={2} />;
    default:
      return <GridSkeleton columns={3} rows={2} />;
  }
}

export function SectionSkeleton({ type, engine, label, tone }: Props) {
  const renderBody = () => {
    switch (type) {
      case "hero":
        return (
          <div
            className={`${styles.skelBlock} ${styles.heroBlock} ${tone ? styles[`hero_${tone}`] : ""}`}
          />
        );
      case "promo":
        return <div className={`${styles.skelBlock} ${styles.promoBlock}`} />;
      case "products":
      case "courses":
      case "portfolios":
      case "featured-project":
        return renderContentSkeleton(engine);
      case "counter":
        return (
          <div className={styles.counterRow}>
            <div className={`${styles.skelBlock} ${styles.counterBlock}`} />
            <div className={`${styles.skelBlock} ${styles.counterBlock}`} />
            <div className={`${styles.skelBlock} ${styles.counterBlock}`} />
            <div className={`${styles.skelBlock} ${styles.counterBlock}`} />
          </div>
        );
      case "about":
        return (
          <div>
            <div className={`${styles.skelBlock} ${styles.aboutBlock}`} />
            <div className={`${styles.skelBlock} ${styles.aboutBlock}`} />
            <div className={`${styles.skelBlock} ${styles.aboutBlock}`} />
          </div>
        );
      case "brand":
        return (
          <div className={styles.brandGrid}>
            <div className={`${styles.skelBlock} ${styles.brandBlock}`} />
            <div className={`${styles.skelBlock} ${styles.brandBlock}`} />
            <div className={`${styles.skelBlock} ${styles.brandBlock}`} />
            <div className={`${styles.skelBlock} ${styles.brandBlock}`} />
          </div>
        );
      case "faq":
        return (
          <div>
            <div className={`${styles.skelBlock} ${styles.faqBlock}`} />
            <div className={`${styles.skelBlock} ${styles.faqBlock}`} />
            <div className={`${styles.skelBlock} ${styles.faqBlock}`} />
          </div>
        );
      case "page-header":
        return (
          <div
            className={`${styles.skelBlock} ${styles.heroBlock}`}
            style={{ height: 16 }}
          />
        );
      case "cta":
        return <div className={`${styles.skelBlock} ${styles.ctaBlock}`} />;
      case "trust":
        return <div className={`${styles.skelBlock} ${styles.trustBlock}`} />;
      case "category-filter":
        return (
          <div className={styles.pillRow}>
            <div className={`${styles.skelBlock} ${styles.pillBlock}`} />
            <div className={`${styles.skelBlock} ${styles.pillBlock}`} />
            <div className={`${styles.skelBlock} ${styles.pillBlock}`} />
            <div className={`${styles.skelBlock} ${styles.pillBlock}`} />
          </div>
        );
      default:
        return (
          <div
            className={`${styles.skelBlock} ${styles.heroBlock}`}
            style={{ height: 12 }}
          />
        );
    }
  };

  return (
    <div className={styles.sectionSkeleton}>
      <span className={styles.sectionLabel}>{label}</span>
      {renderBody()}
    </div>
  );
}
