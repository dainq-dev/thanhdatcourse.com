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

const TOKEN_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|==[^=]+==)/g;

function renderLine(line: string): React.ReactNode[] {
  const parts = line.split(TOKEN_RE);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("==") && part.endsWith("==") && part.length > 4) {
      return <mark key={i} className={styles.highlight}>{part.slice(2, -2)}</mark>;
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function ParagraphBlock({ data }: { data: BlockData<"paragraph"> }) {
  const d = data as any;
  const text = data.text || "";
  const lines = text.split("\n");

  const style: React.CSSProperties = {
    textAlign: d.alignment || "left",
    fontSize: SIZE_MAP[d.fontSize || "md"],
    lineHeight: LINE_MAP[d.lineHeight || "normal"],
    fontWeight: WEIGHT_MAP[d.weight || "regular"],
    color: COLOR_MAP[d.color || "inherit"],
  };

  return (
    <p className={d.dropCap ? styles.dropCap : undefined} style={style}>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {renderLine(line)}
        </span>
      ))}
    </p>
  );
}
