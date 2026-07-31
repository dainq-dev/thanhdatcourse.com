"use client";

import type { Block, BlockData } from "@workspace/types";
import { useState } from "react";
import { BlockRenderer } from "../BlockRenderer";
import styles from "./TabsBlock.module.scss";

export function TabsBlock({ data }: { data: BlockData<"tabs"> }) {
  const d = data as any;
  const tabs = d.tabs || [];
  const [active, setActive] = useState(d.defaultTab || 0);
  const isVertical = d.tabStyle === "vertical";
  const isPills = d.tabStyle === "pills";

  return (
    <div className={`${styles.root} ${isVertical ? styles.vertical : ""}`}>
      <div className={`${styles.nav} ${isPills ? styles.pills : ""}`}>
        {tabs.map((tab: any, i: number) => (
          <button
            key={i}
            type="button"
            className={`${styles.tab} ${i === active ? styles.tabActive : ""}`}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.panels}>
        {tabs.map((tab: any, i: number) => (
          <div
            key={i}
            className={`${styles.panel} ${i === active ? styles.panelActive : ""}`}
          >
            <BlockRenderer blocks={(tab.content || []) as Block[]} />
          </div>
        ))}
      </div>
    </div>
  );
}
