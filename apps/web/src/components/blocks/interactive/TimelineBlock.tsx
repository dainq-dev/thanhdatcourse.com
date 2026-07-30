import type { BlockData } from "@workspace/types";
import styles from "./TimelineBlock.module.scss";

export function TimelineBlock({ data }: { data: BlockData<"timeline"> }) {
  return (
    <div className={styles.root}>Timeline: {data.events.length} events</div>
  );
}
