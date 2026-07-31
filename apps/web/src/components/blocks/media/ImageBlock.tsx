"use client";

import type React from "react";
import { useState } from "react";
import { resolveMediaUrl } from "@/lib/media-url";
import styles from "./ImageBlock.module.scss";

const ROUNDED_MAP: Record<string, string> = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};
const BORDER_MAP: Record<string, string> = {
  none: "none",
  thin: "1px solid var(--color-border, #334155)",
  medium: "2px solid var(--color-border, #334155)",
  thick: "4px solid var(--color-border, #334155)",
};
const SHADOW_MAP: Record<string, string> = {
  none: "none",
  sm: "0 1px 3px rgba(0,0,0,0.12)",
  md: "0 4px 12px rgba(0,0,0,0.15)",
  lg: "0 10px 30px rgba(0,0,0,0.2)",
  xl: "0 20px 60px rgba(0,0,0,0.3)",
};

export function ImageBlock({
  data,
}: {
  data: {
    mediaId: string;
    alt?: string;
    caption?: string;
    width: string;
    rounded: string;
    border: string;
    shadow: string;
    hoverZoom: boolean;
    link?: string;
    objectFit: string;
  };
}) {
  const [failed, setFailed] = useState(false);
  const style: React.CSSProperties = {
    borderRadius: ROUNDED_MAP[data.rounded || "none"],
    border: BORDER_MAP[data.border || "none"],
    boxShadow: SHADOW_MAP[data.shadow || "none"],
    overflow: "hidden",
  };
  const src = resolveMediaUrl(data.mediaId, "medium");
  if (!data.mediaId || failed) {
    return (
      <figure
        className={`${styles.figure} ${styles[data.width || "wide"]}`}
        style={style}
      >
        <div className={styles.placeholder}>Chưa chọn ảnh</div>
      </figure>
    );
  }
  const img = (
    <img
      className={`${styles.img} ${data.hoverZoom ? styles.hoverZoom : ""}`}
      src={src}
      alt={data.alt || ""}
      loading="lazy"
      style={{
        objectFit: (data.objectFit ||
          "cover") as React.CSSProperties["objectFit"],
      }}
      onError={() => setFailed(true)}
    />
  );
  return (
    <figure
      className={`${styles.figure} ${styles[data.width || "wide"]}`}
      style={style}
    >
      {data.link ? (
        <a href={data.link} target="_blank" rel="noopener noreferrer">
          {img}
        </a>
      ) : (
        img
      )}
      {data.caption && (
        <figcaption className={styles.caption}>{data.caption}</figcaption>
      )}
    </figure>
  );
}
