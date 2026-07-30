"use client";

import type { Content } from "@workspace/types";
import styles from "./workspace.module.scss";

interface Props {
  onSave?: () => void | Promise<void>;
  onPublish?: () => void | Promise<void>;
  saving?: boolean;
  isPreview: boolean;
  onTogglePreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  blocks: Content;
}

export function TopBar({ onSave, onPublish, saving, isPreview, onTogglePreview, onUndo, onRedo, canUndo, canRedo, blocks }: Props) {
  return (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <button type="button" className={styles.topBarBtn} onClick={onUndo} disabled={!canUndo} title="Ctrl+Z">↩</button>
        <button type="button" className={styles.topBarBtn} onClick={onRedo} disabled={!canRedo} title="Ctrl+Shift+Z">↪</button>
        <span className={styles.topBarSep}>|</span>
        <span className={styles.topBarInfo}>{blocks.length} blocks</span>
      </div>
      <div className={styles.topBarRight}>
        <button
          type="button"
          className={`${styles.topBarAction} ${isPreview ? styles.active : ""}`}
          onClick={onTogglePreview}
        >
          {isPreview ? "← Chỉnh sửa" : "Xem trước"}
        </button>
        {onSave && (
          <button type="button" className={styles.topBarAction} onClick={onSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu nháp"}
          </button>
        )}
        {onPublish && (
          <button type="button" className={styles.topBarPublish} onClick={onPublish} disabled={saving}>
            Xuất bản
          </button>
        )}
      </div>
    </div>
  );
}
