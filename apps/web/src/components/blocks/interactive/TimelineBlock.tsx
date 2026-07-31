import type { BlockData } from "@workspace/types";
import styles from "./TimelineBlock.module.scss";

export function TimelineBlock({ data }: { data: BlockData<"timeline"> }) {
  const d = data as any;
  const events = d.events || [];
  const isHorizontal = d.layout === "horizontal";
  const isAlternating = d.layout === "alternating";

  return (
    <div className={`${styles.root} ${isHorizontal ? styles.horizontal : ""}`}>
      {events.map((ev: any, i: number) => (
        <div
          key={i}
          className={`${styles.event} ${isAlternating ? (i % 2 === 0 ? styles.left : styles.right) : ""}`}
        >
          <div className={styles.marker}>
            <div className={styles.dot} />
          </div>
          <div className={styles.content}>
            <div className={styles.date}>{ev.date}</div>
            <div className={styles.title}>{ev.title}</div>
            {ev.description && (
              <div className={styles.desc}>{ev.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
