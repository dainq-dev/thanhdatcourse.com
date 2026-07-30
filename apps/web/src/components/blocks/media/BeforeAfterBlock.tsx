"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { BlockData } from "@workspace/types";
import styles from "./BeforeAfterBlock.module.scss";

const ROUNDED_MAP: Record<string, string> = { none: "0", sm: "4px", md: "8px", lg: "16px", full: "9999px" };

export function BeforeAfterBlock({ data }: { data: BlockData<"beforeAfter"> }) {
  const d = data as any;
  const [pos, setPos] = useState(50);
  const isVertical = d.orientation === "vertical";
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = isVertical ? ((clientY - rect.top) / rect.height) * 100 : ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, [isVertical]);

  const onPointerDown = useCallback(() => { dragging.current = true; }, []);
  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => { if (dragging.current) updatePos(e.clientX, e.clientY); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onPointerUp); };
  }, [updatePos, onPointerUp]);

  const clipStyle = isVertical ? { clipPath: `inset(0 0 ${100 - pos}% 0)` } : { clipPath: `inset(0 ${100 - pos}% 0 0)` };
  const style: React.CSSProperties = { borderRadius: ROUNDED_MAP[d.rounded || "none"], overflow: "hidden" };

  return (
    <figure ref={containerRef} className={`${styles.root} ${isVertical ? styles.vertical : ""}`} style={style}>
      <div className={styles.after}>
        <img src={`/api/media/${d.afterMediaId}/file`} alt={d.afterLabel} className={styles.img} />
      </div>
      <div className={styles.before} style={clipStyle}>
        <img src={`/api/media/${d.beforeMediaId}/file`} alt={d.beforeLabel} className={styles.img} />
      </div>
      <div className={`${styles.handle} ${isVertical ? styles.handleV : ""}`} style={isVertical ? { top: `${pos}%` } : { left: `${pos}%` }} onPointerDown={onPointerDown}>
        <div className={styles.handleLine} />
        <div className={styles.handleLabel}><span>{d.beforeLabel}</span><span>{d.afterLabel}</span></div>
      </div>
      {d.caption && <figcaption className={styles.caption}>{d.caption}</figcaption>}
    </figure>
  );
}
