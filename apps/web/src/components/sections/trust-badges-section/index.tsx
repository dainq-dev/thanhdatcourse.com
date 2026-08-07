"use client";

import type { ComponentType } from "react";
import styles from "./index.module.scss";

interface TrustBadgeItem {
  text: string;
}

interface TrustBadgesSectionConfig {
  items?: TrustBadgeItem[];
}

export const TrustBadgesSection: ComponentType<{
  config: Record<string, unknown>;
}> = ({ config }) => {
  const c = config as TrustBadgesSectionConfig;
  const items: TrustBadgeItem[] = Array.isArray(c.items) ? c.items : [];

  if (items.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.row}>
          {items.map((item, i) => (
            <div key={i} className={styles.feature}>
              <svg className={styles.icon} viewBox="0 0 512 512">
                <path d="M505 174.8l-39.6-39.6c-9.4-9.4-24.6-9.4-33.9 0L192 374.7 80.6 263.2c-9.4-9.4-24.6-9.4-33.9 0L7 302.9c-9.4 9.4-9.4 24.6 0 34L175 505c9.4 9.4 24.6 9.4 33.9 0l296-296.2c9.4-9.5 9.4-24.7.1-34zm-324.3 106c6.2 6.3 16.4 6.3 22.6 0l208-208.2c6.2-6.3 6.2-16.4 0-22.6L366.1 4.7c-6.2-6.3-16.4-6.3-22.6 0L192 156.2l-55.4-55.5c-6.2-6.3-16.4-6.3-22.6 0L68.7 146c-6.2 6.3-6.2 16.4 0 22.6l112 112.2z" />
              </svg>
              <h3 className={styles.heading}>{item.text || ""}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
