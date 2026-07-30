import type { BlockData } from "@workspace/types";
import styles from "./BeforeAfterBlock.module.scss";

export function BeforeAfterBlock({ data }: { data: BlockData<"beforeAfter"> }) {
  return (
    <div className={styles.root}>
      Before/After: {data.beforeLabel} → {data.afterLabel}
    </div>
  );
}
