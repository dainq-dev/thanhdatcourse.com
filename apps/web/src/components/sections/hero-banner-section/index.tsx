"use client";

import type { ComponentType } from "react";
import styles from "./index.module.scss";

interface HeroBannerSectionConfig {
  badge_text?: string;
  badge_subtitle?: string;
  title?: string;
  subtitle?: string;
  subtitle_highlight?: string;
  video_thumbnail_url?: string;
  video_youtube_url?: string;
  cta_text?: string;
  cta_url?: string;
  note_text?: string;
}

export const HeroBannerSection: ComponentType<{
  config: Record<string, unknown>;
}> = ({ config }) => {
  const c = config as HeroBannerSectionConfig;
  const badgeText = c.badge_text || "";
  const badgeSubtitle = c.badge_subtitle || "";
  const title = c.title || "";
  const subtitle = c.subtitle || "";
  const subtitleHighlight = c.subtitle_highlight || "";
  const thumbnailUrl = c.video_thumbnail_url || "";
  const youtubeUrl = c.video_youtube_url || "";
  const ctaText = c.cta_text || "";
  const ctaUrl = c.cta_url || "";
  const noteText = c.note_text || "";

  const hasBadge = badgeText || badgeSubtitle;
  const hasSubtitleHighlight =
    subtitle.includes(subtitleHighlight) || !subtitleHighlight;

  const renderSubtitle = () => {
    if (!subtitle) return null;
    if (subtitleHighlight && subtitle.includes(subtitleHighlight)) {
      const parts = subtitle.split(subtitleHighlight);
      return (
        <p className={styles.subtitle}>
          {parts[0]}
          <span className={styles.pink}>{subtitleHighlight}</span>
          {parts.slice(1).join(subtitleHighlight)}
        </p>
      );
    }
    return <p className={styles.subtitle}>{subtitle}</p>;
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {hasBadge && (
          <div className={styles.badgeBlock}>
            {badgeText && <p className={styles.badgeText}>{badgeText}</p>}
            {badgeSubtitle && (
              <p className={styles.badgeSubtitle}>{badgeSubtitle}</p>
            )}
          </div>
        )}

        {title && <h1 className={styles.title}>{title}</h1>}
        {renderSubtitle()}

        {thumbnailUrl && (
          <div className={styles.videoWrap}>
            <a
              href={youtubeUrl || "#"}
              target={youtubeUrl ? "_blank" : undefined}
              rel={youtubeUrl ? "noopener noreferrer" : undefined}
            >
              <img src={thumbnailUrl} alt={title || "Video thumbnail"} />
              <span className={styles.playBtn}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    stroke="white"
                    strokeWidth="3"
                    fill="rgba(0,0,0,0.5)"
                  />
                  <path d="M33 25L55 40L33 55V25Z" fill="white" />
                </svg>
              </span>
            </a>
          </div>
        )}

        {ctaText && (
          <p className={styles.ctaWrap}>
            <a className={styles.btnCta} href={ctaUrl || "#"}>
              {ctaText}
            </a>
          </p>
        )}

        {noteText && <p className={styles.note}>{noteText}</p>}
      </div>
    </section>
  );
};
