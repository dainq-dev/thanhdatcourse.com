import type { BlockData } from "@workspace/types";
import type React from "react";
import styles from "./ParagraphBlock.module.scss";

const COLOR_MAP: Record<string, string> = {
  inherit: "inherit",
  "--color-text": "var(--color-text, #F1F5F9)",
  "--color-text-muted": "var(--color-text-muted, #94A3B8)",
  "--color-primary": "var(--color-primary, #3B82F6)",
  "--color-accent": "var(--color-accent, #F59E0B)",
  "--color-border": "var(--color-border, #334155)",
};

const WEIGHT_MAP: Record<string, string> = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

const SIZE_MAP: Record<string, string> = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
};

const LINE_MAP: Record<string, string> = {
  tight: "1.4",
  normal: "1.7",
  relaxed: "2",
};

export function ParagraphBlock({ data }: { data: BlockData<"paragraph"> }) {
  const d = data as any;
  const style: React.CSSProperties = {
    textAlign: d.alignment || "left",
    fontSize: SIZE_MAP[d.fontSize || "md"],
    lineHeight: LINE_MAP[d.lineHeight || "normal"],
    fontWeight: WEIGHT_MAP[d.weight || "regular"],
    color: COLOR_MAP[d.color || "inherit"],
  };
  return (
    <p className={d.dropCap ? styles.dropCap : undefined} style={style}>
      {data.text}
    </p>
  );
}
