"use client";

import type { Content } from "@workspace/types";
import { useEffect, useState } from "react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import styles from "./page.module.scss";

export default function XemTruocPage() {
  const [blocks, setBlocks] = useState<Content | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("preview-blocks");
      if (!raw) {
        setError("Không có nội dung để xem trước");
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setError("Dữ liệu xem trước không hợp lệ");
        return;
      }
      setBlocks(parsed);
    } catch (e) {
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        setError(
          "Nội dung quá lớn, không thể xem trước. Vui lòng lưu nháp và xem từ trang bài viết.",
        );
      } else {
        setError("Không thể tải nội dung xem trước");
      }
    }
  }, []);

  if (error) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>Xem trước bài viết</h1>
        <p className={styles.emptyText}>{error}</p>
      </div>
    );
  }

  if (!blocks) {
    return (
      <div className={styles.empty}>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <BlockRenderer blocks={blocks} />
      </article>
    </div>
  );
}
