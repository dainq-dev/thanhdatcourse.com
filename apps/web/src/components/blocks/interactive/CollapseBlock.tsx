"use client";

import type { Block, BlockData } from "@workspace/types";
import { useState } from "react";
import { BlockRenderer } from "../BlockRenderer";
import styles from "./CollapseBlock.module.scss";

export function CollapseBlock({ data }: { data: BlockData<"collapse"> }) {
  const d = data as any;
  const [open, setOpen] = useState(d.defaultOpen || false);
  const iconLeft = d.iconPosition === "left";

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={`${styles.header} ${iconLeft ? styles.headerLeft : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.arrow}>{open ? "▾" : "▸"}</span>
        <span className={styles.title}>{d.title}</span>
      </button>
      {open && (
        <div className={styles.body}>
          <BlockRenderer blocks={(d.content || []) as Block[]} />
        </div>
      )}
    </div>
  );
}
