"use client";

import type { ComponentType } from "react";
import styles from "./index.module.scss";

interface BrandLogo {
  type?: string;
  image_url: string;
  alt?: string;
  text?: string;
}

interface BrandLogosSectionConfig {
  title?: string;
  logos?: BrandLogo[];
  trusted_badge_url?: string;
  student_count_title?: string;
}

export const BrandLogosSection: ComponentType<{
  config: Record<string, unknown>;
}> = ({ config }) => {
  const c = config as BrandLogosSectionConfig;
  const title = c.title || "";
  const logos: BrandLogo[] = Array.isArray(c.logos) ? c.logos : [];
  const trustedBadgeUrl = c.trusted_badge_url || "";
  const studentCountTitle = c.student_count_title || "";

  return (
    <section className={styles.brands}>
      <div className={styles.container}>
        {title && <h2 className={styles.title}>{title}</h2>}

        {logos.length > 0 && (
          <div className={styles.grid}>
            {logos.map((logo, i) =>
              (logo.type ?? "image") === "text" ? (
                <span key={i} className={styles.textLogo}>
                  {logo.text || logo.alt || ""}
                </span>
              ) : (
                <img
                  key={i}
                  src={logo.image_url}
                  alt={logo.alt || ""}
                  className={styles.logoImg}
                />
              ),
            )}
          </div>
        )}

        {trustedBadgeUrl && (
          <p className={styles.badgeWrap}>
            <img
              src={trustedBadgeUrl}
              alt="Trusted badges"
              className={styles.trustedBadge}
            />
          </p>
        )}

        {studentCountTitle && (
          <h2 className={styles.studentTitle}>{studentCountTitle}</h2>
        )}
      </div>
    </section>
  );
};
