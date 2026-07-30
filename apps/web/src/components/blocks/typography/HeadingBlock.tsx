import type { BlockData } from "@workspace/types";
import type React from "react";
import styles from "./HeadingBlock.module.scss";

export function HeadingBlock({ data }: { data: BlockData<"heading"> }) {
  const Tag = `h${data.level}` as keyof React.JSX.IntrinsicElements;
  return (
    <Tag
      className={styles.root}
      style={{ textAlign: data.alignment || "left" }}
    >
      {data.text}
    </Tag>
  );
}
