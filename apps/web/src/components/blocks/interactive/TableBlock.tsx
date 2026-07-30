import type { BlockData } from "@workspace/types";
import styles from "./TableBlock.module.scss";

export function TableBlock({ data }: { data: BlockData<"table"> }) {
  return (
    <div className={styles.root}>
      Table: {data.headers.length} cols, {data.rows.length} rows
    </div>
  );
}
