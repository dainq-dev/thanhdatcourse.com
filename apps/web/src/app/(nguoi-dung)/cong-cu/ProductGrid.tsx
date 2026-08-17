"use client";

import { useState } from "react";
import { MotionReveal } from "@/components/sections/motion-reveal";
import { getMotionConcept } from "@/lib/motion";
import styles from "./page.module.scss";

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  youtubePreviewId?: string;
  externalCheckoutUrl?: string;
  tag?: string;
  youtubeThumb?: string;
  priceFormatted: string;
}

export function ProductGrid({
  products,
  engine,
}: {
  products: ProductData[];
  engine?: string;
}) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const concept = getMotionConcept(engine, "products", "cascade");

  const resolveThumb = (p: ProductData): string => {
    if (p.thumbnailUrl) return p.thumbnailUrl;
    if (p.youtubeThumb) return p.youtubeThumb;
    return "";
  };

  return (
    <>
      <MotionReveal concept={concept}>
        <div className={styles.grid}>
          {products.map((p) => (
            <div key={p.id} className={styles.card} data-motion-item>
              <div className={styles.media}>
                {resolveThumb(p) ? (
                  <>
                    <img src={resolveThumb(p)} alt={p.title} loading="lazy" />
                    {p.youtubePreviewId && (
                      <button
                        type="button"
                        className={styles.playOverlay}
                        onClick={() => setActiveVideo(p.youtubePreviewId!)}
                        aria-label="Phát video"
                      >
                        <svg viewBox="0 0 48 48" fill="none">
                          <circle
                            cx="24"
                            cy="24"
                            r="22"
                            fill="rgba(0,0,0,0.6)"
                            stroke="white"
                            strokeWidth="2"
                          />
                          <polygon points="20,15 33,24 20,33" fill="white" />
                        </svg>
                      </button>
                    )}
                  </>
                ) : null}
                {p.tag && <span className={styles.tag}>{p.tag}</span>}
              </div>
              <div className={styles.body}>
                <h2 className={styles.title}>{p.title}</h2>
                {p.description && (
                  <p className={styles.desc}>{p.description}</p>
                )}
                <p className={styles.price}>{p.priceFormatted}</p>
                {p.externalCheckoutUrl && (
                  <a
                    href={p.externalCheckoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.buyBtn}
                  >
                    Mua ngay
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </MotionReveal>

      {activeVideo && (
        <div className={styles.videoModal} onClick={() => setActiveVideo(null)}>
          <div
            className={styles.videoInner}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setActiveVideo(null)}
              aria-label="Đóng video"
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              title="YouTube video player"
              className={styles.videoIframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
