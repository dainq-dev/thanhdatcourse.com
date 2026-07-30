"use client";

import styles from "./page.module.scss";
import { useStickyCTA } from "./StickyCTA.logic";

interface CourseStickyCTAProps {
  price: string;
  checkoutUrl: string;
}

export function CourseStickyCTA({ price, checkoutUrl }: CourseStickyCTAProps) {
  const { ref } = useStickyCTA();

  return (
    <div ref={ref} className={styles.stickyBar}>
      <span className={styles.stickyPriceLabel}>{price}đ</span>
      <span className={styles.stickyPrice}>(1 năm)</span>
      <a
        href={checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.stickyCta}
      >
        ĐĂNG KÝ TẠI ĐÂY!
      </a>
    </div>
  );
}
