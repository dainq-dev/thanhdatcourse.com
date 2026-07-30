import type { BlockData } from "@workspace/types";
import styles from "./ColumnsBlock.module.scss";

export function ColumnsBlock({ data }: { data: BlockData<"columns"> }) {
  return <div className={styles.root}>Columns: {data.columns} cols</div>;
}
