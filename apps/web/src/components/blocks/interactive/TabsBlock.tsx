import type { BlockData } from "@workspace/types";
import styles from "./TabsBlock.module.scss";

export function TabsBlock({ data }: { data: BlockData<"tabs"> }) {
  return <div className={styles.root}>Tabs: {data.tabs.length} tabs</div>;
}
