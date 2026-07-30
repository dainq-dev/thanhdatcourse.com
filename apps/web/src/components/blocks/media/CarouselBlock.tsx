"use client";

import type { BlockData } from "@workspace/types";
import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./CarouselBlock.module.scss";

const ROUNDED_MAP: Record<string, string> = { none: "0", sm: "4px", md: "8px", lg: "16px", full: "9999px" };

export function CarouselBlock({ data }: { data: BlockData<"carousel"> }) {
  const d = data as any;
  const slides = d.slides || [];
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = Math.max(1, Math.ceil(slides.length / (d.slidesPerView || 1)));
  const safeCurrent = current % total;

  const goTo = useCallback((idx: number) => setCurrent(((idx % total) + total) % total), [total]);
  const next = useCallback(() => goTo(safeCurrent + 1), [safeCurrent, goTo]);
  const prev = useCallback(() => goTo(safeCurrent - 1), [safeCurrent, goTo]);

  useEffect(() => {
    if (d.autoplay && slides.length > 1) {
      timerRef.current = setInterval(next, d.interval || 5000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [d.autoplay, d.interval, next, slides.length]);

  if (slides.length === 0) return <div className={styles.empty}>Chưa có slide nào</div>;

  const ratioClass = d.aspectRatio === "16:9" ? styles.r169 : d.aspectRatio === "4:3" ? styles.r43 : d.aspectRatio === "1:1" ? styles.r11 : "";

  return (
    <div className={styles.root} onMouseEnter={() => { if (d.pauseOnHover && timerRef.current) clearInterval(timerRef.current); }}
      onMouseLeave={() => { if (d.autoplay && d.pauseOnHover && slides.length > 1) timerRef.current = setInterval(next, d.interval || 5000); }}>
      <div className={`${styles.track} ${styles[`trans_${d.transition || "slide"}`]}`}
        style={{
          transform: `translateX(-${safeCurrent * (100 / (d.slidesPerView || 1))}%)`,
          borderRadius: ROUNDED_MAP[d.rounded || "none"],
          overflow: "hidden",
        }}>
        {slides.map((s: any, i: number) => (
          <div key={i} className={`${styles.slide} ${ratioClass}`} style={{ flex: `0 0 ${100 / (d.slidesPerView || 1)}%` }}>
            <img src={`/api/media/${s.mediaId}/file`} alt={s.caption || ""} className={styles.img} loading="lazy" />
            {s.caption && <div className={styles.caption}>{s.caption}</div>}
          </div>
        ))}
      </div>
      {d.showArrows && slides.length > 1 && (
        <>
          <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev}>‹</button>
          <button type="button" className={`${styles.arrow} ${styles.arrowRight}`} onClick={next}>›</button>
        </>
      )}
      {d.showDots && slides.length > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: total }, (_, i) => (
            <button key={i} type="button" className={`${styles.dot} ${i === safeCurrent ? styles.dotActive : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
