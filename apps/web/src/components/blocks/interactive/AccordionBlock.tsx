"use client";

import type { Block, BlockData } from "@workspace/types";
import { useState } from "react";
import { BlockRenderer } from "../BlockRenderer";
import styles from "./AccordionBlock.module.scss";

export function AccordionBlock({ data }: { data: BlockData<"accordion"> }) {
  const d = data as any;
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(() => {
    const s = new Set<number>();
    if (d.defaultOpenIndex >= 0 && d.defaultOpenIndex < (d.items || []).length)
      s.add(d.defaultOpenIndex);
    return s;
  });

  const toggle = (i: number) => {
    const next = new Set(openIndexes);
    if (next.has(i)) next.delete(i);
    else {
      if (!d.allowMultiple) next.clear();
      next.add(i);
    }
    setOpenIndexes(next);
  };

  const iconLeft = d.iconPosition === "left";
  const bordered = d.borderStyle !== "borderless";

  return (
    <div className={`${styles.root} ${bordered ? styles.bordered : ""}`}>
      {(d.items || []).map((item: any, i: number) => {
        const isOpen = openIndexes.has(i);
        return (
          <div
            key={i}
            className={`${styles.item} ${isOpen ? styles.open : ""}`}
          >
            <button
              type="button"
              className={`${styles.header} ${iconLeft ? styles.headerLeft : ""}`}
              onClick={() => toggle(i)}
            >
              <span className={styles.arrow}>{isOpen ? "▾" : "▸"}</span>
              <span className={styles.title}>{item.title}</span>
            </button>
            {isOpen && (
              <div className={styles.body}>
                <BlockRenderer blocks={(item.content || []) as Block[]} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
