"use client";

import { useState } from "react";
import { MediaManager } from "./index";
import styles from "./index.module.scss";
import type { MediaFilter } from "./types";

interface Props {
  onSelect: (url: string) => void;
  value?: string;
  filter?: MediaFilter;
  accept?: string;
  children?: React.ReactNode;
  showPreview?: boolean;
}

export function MediaTrigger({
  onSelect,
  value,
  filter,
  accept,
  children,
  showPreview,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`${styles.triggerBtn} ${!children ? styles.triggerBlock : ""}`}
        onClick={() => setOpen(true)}
      >
        {showPreview && value ? (
          <img src={value} alt="" className={styles.previewBadge} />
        ) : null}
        {children || "Chọn từ thư viện"}
      </button>
      <MediaManager
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
        filter={filter}
        accept={accept}
        value={value}
      />
    </>
  );
}
