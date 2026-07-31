import type { BlockData } from "@workspace/types";
import styles from "./TestimonialBlock.module.scss";

const BG_MAP: Record<string, string> = {
  none: "transparent",
  light: "var(--color-surface, #1E293B)",
  dark: "#0F172A",
  gradient: "linear-gradient(135deg, #1E3A5F, #0F172A)",
};

export function TestimonialBlock({ data }: { data: BlockData<"testimonial"> }) {
  const d = data as any;

  // Placeholder — real implementation would fetch testimonial by ID
  return (
    <div
      className={`${styles.root} ${styles[`style_${d.style || "card"}`]}`}
      style={{ background: BG_MAP[d.background || "none"] }}
    >
      {d.showAvatar && (
        <div
          className={`${styles.avatar} ${styles[`avatar_${d.avatarSize || "md"}`]}`}
        >
          👤
        </div>
      )}
      {d.showRating && <div className={styles.rating}>★★★★★</div>}
      <blockquote className={styles.quote}>
        "Đây là một trải nghiệm tuyệt vời..."
      </blockquote>
      <cite className={styles.cite}>— Học viên</cite>
    </div>
  );
}
