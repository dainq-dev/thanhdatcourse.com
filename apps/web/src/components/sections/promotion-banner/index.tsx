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

function toTimeLeft(endDate: string): string | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(days).padStart(2, "0")} : ${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`;
}

export function PromotionBanner() {
  const [data, setData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
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
    const update = () => {
      const t = toTimeLeft(data.endDate!);
      if (!t) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft(t);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [data]);

  useGSAP(
    () => {
      if (!countdownRef.current || !timeLeft) return;
      const parts = countdownRef.current.querySelectorAll(
        `.${styles.countdownItem}`,
      );
      gsap.fromTo(
        parts,
        { scale: 1.05 },
        { scale: 1, duration: 0.6, ease: "power2.out" },
      );
    },
    { dependencies: [timeLeft] },
  );

  if (loading || !data) return null;

  const countdownParts = timeLeft ? timeLeft.split(" : ") : null;

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
        <span className={styles.tag}>Khuyến mãi</span>
        <h2 className={styles.title}>{data.campaignName}</h2>
        <p className={styles.discount}>
          Giảm <strong>{data.discountPercentage}%</strong>
        </p>
        {data.couponCode && (
          <p className={styles.coupon}>
            Mã: <code>{data.couponCode}</code>
          </p>
        )}
        {countdownParts && (
          <div ref={countdownRef} className={styles.countdown}>
            {countdownParts.map((val, i) => (
              <span key={i} className={styles.countdownItem}>
                {val}
              </span>
            ))}
          </div>
        )}
        <Link href="/khoa-hoc" className={styles.cta}>
          Xem khóa học ngay
        </Link>
      </div>
    </section>
  );
}
