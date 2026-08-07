"use client";

import { type ComponentType, useCallback, useEffect, useState } from "react";
import styles from "./index.module.scss";

interface CountdownOfferSectionConfig {
  title?: string;
  title_highlight?: string;
  banner_url?: string;
  current_price?: number;
  original_price?: number;
  bonus_count?: number;
  cta_text?: string;
  cta_url?: string;
  countdown_seconds?: number;
}

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export const CountdownOfferSection: ComponentType<{
  config: Record<string, unknown>;
}> = ({ config }) => {
  const c = config as CountdownOfferSectionConfig;
  const title = c.title || "";
  const titleHighlight = c.title_highlight || "";
  const bannerUrl = c.banner_url || "";
  const currentPrice =
    typeof c.current_price === "number" ? c.current_price : 996000;
  const originalPrice =
    typeof c.original_price === "number" ? c.original_price : 15472000;
  const bonusCount = typeof c.bonus_count === "number" ? c.bonus_count : 5;
  const ctaText = c.cta_text || "";
  const ctaUrl = c.cta_url || "";
  const countdownSeconds =
    typeof c.countdown_seconds === "number" && c.countdown_seconds > 0
      ? c.countdown_seconds
      : 7140;

  const getTarget = useCallback(
    () => Date.now() + countdownSeconds * 1000,
    [countdownSeconds],
  );
  const [target, setTarget] = useState(getTarget);
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      if (diff <= 0) {
        const newTarget = getTarget();
        setTarget(newTarget);
        setTimeLeft(countdownSeconds);
        return;
      }
      setTimeLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, countdownSeconds, getTarget]);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const renderTitle = () => {
    if (!title) return null;
    if (titleHighlight && title.includes(titleHighlight)) {
      const parts = title.split(titleHighlight);
      return (
        <h2 className={styles.title}>
          {parts[0]}
          <span className={styles.pink}>{titleHighlight}</span>
          {parts.slice(1).join(titleHighlight)}
        </h2>
      );
    }
    return <h2 className={styles.title}>{title}</h2>;
  };

  return (
    <section className={styles.offer}>
      <div className={styles.container}>
        {renderTitle()}

        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="Ưu đãi giới hạn"
            className={styles.banner}
          />
        )}

        <div className={styles.priceBlock}>
          <p>Nhận ngay {bonusCount} ưu đãi bổ sung hoàn toàn miễn phí.</p>
          <p>
            <strong>
              Tất cả khóa học chỉ với{" "}
              <span className={styles.pink}>{formatVND(currentPrice)}</span>{" "}
              (giá gốc{" "}
              <span className={styles.priceOld}>
                {formatVND(originalPrice)}
              </span>
              ).
            </strong>
          </p>
          <p>
            <strong>Ưu đãi có hạn – đừng bỏ lỡ cơ hội vàng này!</strong>
          </p>
        </div>

        <div className={styles.countdown} aria-label="Đếm ngược ưu đãi">
          <div className={styles.countdownItem}>
            <span className={styles.num}>{String(days).padStart(2, "0")}</span>
            <span className={styles.label}>Ngày</span>
          </div>
          <div className={styles.countdownItem}>
            <span className={styles.num}>{String(hours).padStart(2, "0")}</span>
            <span className={styles.label}>Giờ</span>
          </div>
          <div className={styles.countdownItem}>
            <span className={styles.num}>
              {String(minutes).padStart(2, "0")}
            </span>
            <span className={styles.label}>Phút</span>
          </div>
          <div className={styles.countdownItem}>
            <span className={styles.num}>
              {String(seconds).padStart(2, "0")}
            </span>
            <span className={styles.label}>Giây</span>
          </div>
        </div>

        {ctaText && (
          <p>
            <a className={styles.btnCta} href={ctaUrl || "#"}>
              {ctaText}
            </a>
          </p>
        )}
      </div>
    </section>
  );
};
