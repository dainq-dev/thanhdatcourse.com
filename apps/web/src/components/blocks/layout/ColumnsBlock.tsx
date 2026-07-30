import type { BlockData, Block } from "@workspace/types";
import { BlockRenderer } from "../BlockRenderer";
import styles from "./ColumnsBlock.module.scss";

const RATIO_MAP: Record<string, string[]> = {
  auto: ["1fr", "1fr"],
  "50-50": ["1fr", "1fr"],
  "33-33-33": ["1fr", "1fr", "1fr"],
  "25-75": ["1fr", "3fr"],
  "75-25": ["3fr", "1fr"],
  "33-67": ["1fr", "2fr"],
  "67-33": ["2fr", "1fr"],
};

const GAP_MAP: Record<string, string> = { sm: "16px", md: "32px", lg: "48px" };

export function ColumnsBlock({ data }: { data: BlockData<"columns"> }) {
  const d = data as any;
  const ratios = RATIO_MAP[d.columnRatios || "auto"] || ["1fr", "1fr"];

  return (
    <div className={styles.root}
      style={{
        gridTemplateColumns: ratios.slice(0, d.columns || 2).join(" "),
        gap: GAP_MAP[d.gap || "md"],
      }}>
      {Array.from({ length: d.columns || 2 }, (_, i) => (
        <div key={i} className={styles.col}>
          <BlockRenderer blocks={(d.content?.[i] || []) as Block[]} />
        </div>
      ))}
    </div>
  );
}
