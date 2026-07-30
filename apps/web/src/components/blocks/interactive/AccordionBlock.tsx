import type { BlockData } from "@workspace/types";
import styles from "./AccordionBlock.module.scss";

export function AccordionBlock({ data }: { data: BlockData<"accordion"> }) {
  return (
    <div className={styles.root}>
      Accordion: {data.items[0]?.title || "untitled"}
    </div>
  );
}
