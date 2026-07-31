import type { BlockData } from "@workspace/types";
import type React from "react";
import styles from "./HeadingBlock.module.scss";

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

export function HeadingBlock({ data }: { data: BlockData<"heading"> }) {
  const Tag = `h${data.level}` as keyof React.JSX.IntrinsicElements;
  const style: React.CSSProperties = {
    textAlign: ((data.alignment as string) ||
      "left") as React.CSSProperties["textAlign"],
    fontWeight: WEIGHT_MAP[data.weight || "bold"],
    fontStyle: (data as any).italic ? "italic" : undefined,
    textDecoration: (data as any).underline ? "underline" : undefined,
    color: COLOR_MAP[(data as any).color || "inherit"],
  };
  return (
    <Tag className={styles.root} style={style}>
      {data.text}
    </Tag>
  );
}
