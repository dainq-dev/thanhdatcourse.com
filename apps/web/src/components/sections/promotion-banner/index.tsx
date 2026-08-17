"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import styles from "./index.module.scss";

interface BannerData {
  id: string;
  campaignName: string;
  discountPercentage: number;
  bannerImageUrl?: string;
  endDate?: string;
  couponCode?: string;
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function toTimeParts(endDate: string): TimeParts | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

const UNITS = [
  { key: "days", label: "Ngày" },
  { key: "hours", label: "Giờ" },
  { key: "minutes", label: "Phút" },
  { key: "seconds", label: "Giây" },
] as const;

export function PromotionBanner() {
  const [data, setData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeParts | null>(null);
  const countdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .publicGet<BannerData>("/api/promotions/homepage-banner")
      .then((json) => {
        setData(json);
      })
      .catch(() => {
        //
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data?.endDate) return;
    const update = () => setTimeLeft(toTimeParts(data.endDate!));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [data]);

  useGSAP(
    () => {
      if (!countdownRef.current || !timeLeft) return;
      const items = countdownRef.current.querySelectorAll(
        `.${styles.countdownItem}`,
      );
      gsap.fromTo(
        items,
        { scale: 1.04, y: 6 },
        { scale: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
    },
    { dependencies: [timeLeft?.seconds] },
  );

  if (loading || !data) return null;

  return (
    <section className={styles.banner}>
      {data.bannerImageUrl && (
        <div
          className={styles.bg}
          style={{ backgroundImage: `url(${data.bannerImageUrl})` }}
        />
      )}
      <div className={styles.overlay} />
      <div className={styles.content}>
        <span className={styles.tag}>Khuyến mãi có hạn</span>
        <h2 className={styles.title}>{data.campaignName}</h2>

        <div className={styles.discountRow}>
          <span className={styles.discountLabel}>Giảm ngay</span>
          <span className={styles.discountValue}>
            {data.discountPercentage}%
          </span>
        </div>

        {data.couponCode && (
          <p className={styles.coupon}>
            Mã ưu đãi: <code>{data.couponCode}</code>
          </p>
        )}

        {timeLeft ? (
          <>
            <p className={styles.countdownLabel}>Kết thúc sau</p>
            <div ref={countdownRef} className={styles.countdown}>
              {UNITS.map((u) => (
                <div key={u.key} className={styles.countdownItem}>
                  <span className={styles.countdownNumber}>
                    {String(timeLeft[u.key]).padStart(2, "0")}
                  </span>
                  <span className={styles.countdownUnit}>{u.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.expired}>Ưu đãi đã kết thúc</p>
        )}

        <Link href="/khoa-hoc" className={styles.cta}>
          Xem khóa học ngay
        </Link>
      </div>
    </section>
  );
}
