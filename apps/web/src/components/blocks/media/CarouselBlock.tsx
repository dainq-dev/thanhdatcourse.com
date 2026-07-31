"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resolveMediaUrl } from "@/lib/media-url";
import styles from "./CarouselBlock.module.scss";

const ROUNDED_MAP: Record<string, string> = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};

export function CarouselBlock({
  data,
}: {
  data: {
    slides: { mediaId: string; caption?: string }[];
    autoplay: boolean;
    interval: number;
    showDots: boolean;
    showArrows: boolean;
    transition: string;
    rounded: string;
    shadow: string;
    aspectRatio: string;
    loop: boolean;
    pauseOnHover: boolean;
    slidesPerView: number;
  };
}) {
  const d = data;
  const slides = d.slides || [];
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const perView = d.slidesPerView || 1;
  const total = Math.max(1, slides.length);
  const safeCurrent = ((current % total) + total) % total;

  const goTo = useCallback(
    (idx: number) => setCurrent(((idx % total) + total) % total),
    [total],
  );
  const next = useCallback(() => goTo(safeCurrent + 1), [safeCurrent, goTo]);
  const prev = useCallback(() => goTo(safeCurrent - 1), [safeCurrent, goTo]);

  useEffect(() => {
    if (d.autoplay && slides.length > perView) {
      timerRef.current = setInterval(next, d.interval || 5000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [d.autoplay, d.interval, next, slides.length, perView]);

  if (slides.length === 0)
    return <div className={styles.empty}>Chưa có slide nào</div>;

  const ratioClass =
    d.aspectRatio === "16:9"
      ? styles.r169
      : d.aspectRatio === "4:3"
        ? styles.r43
        : d.aspectRatio === "1:1"
          ? styles.r11
          : styles.r169;

  return (
    <div
      className={styles.root}
      onMouseEnter={() => {
        if (d.pauseOnHover && timerRef.current) clearInterval(timerRef.current);
      }}
      onMouseLeave={() => {
        if (d.autoplay && d.pauseOnHover && slides.length > perView)
          timerRef.current = setInterval(next, d.interval || 5000);
      }}
    >
      <div
        className={styles.viewport}
        style={{
          borderRadius: ROUNDED_MAP[d.rounded || "none"],
          overflow: "hidden",
        }}
      >
        <div
          className={`${styles.track} ${styles[`trans_${d.transition || "slide"}`]}`}
          style={{
            transform: `translateX(-${safeCurrent * (100 / perView)}%)`,
          }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className={`${styles.slide} ${ratioClass}`}
              style={{ flex: `0 0 ${100 / perView}%` }}
            >
              <img
                src={resolveMediaUrl(s.mediaId, "medium")}
                alt={s.caption || `Slide ${i + 1}`}
                className={styles.img}
                loading="lazy"
              />
              {s.caption && <div className={styles.caption}>{s.caption}</div>}
            </div>
          ))}
        </div>
      </div>
      {d.showArrows && slides.length > perView && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={prev}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={next}
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}
      {d.showDots && slides.length > perView && (
        <div className={styles.dots}>
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === safeCurrent ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
