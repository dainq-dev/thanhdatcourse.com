"use client";

import type { Content } from "@workspace/types";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import styles from "./workspace.module.scss";

export function BlockPreview({ blocks }: { blocks: Content }) {
  if (blocks.length === 0) {
    return <div className={styles.previewEmpty}>Chưa có nội dung</div>;
  }
  return (
    <div className={styles.previewContent}>
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
