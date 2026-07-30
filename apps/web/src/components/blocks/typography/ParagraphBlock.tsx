import type { BlockData } from "@workspace/types";
import styles from "./ParagraphBlock.module.scss";

export function ParagraphBlock({ data }: { data: BlockData<"paragraph"> }) {
  return (
    <p
      className={[styles.root, data.dropCap ? styles.dropCap : ""]
        .filter(Boolean)
        .join(" ")}
      style={{ textAlign: data.alignment }}
    >
      {data.text}
    </p>
  );
}
