import type { BlockData } from "@workspace/types";
import styles from "./CollapseBlock.module.scss";

export function CollapseBlock({ data }: { data: BlockData<"collapse"> }) {
  return (
    <div className={styles.root}>Collapse: {data.title || "untitled"}</div>
  );
}
