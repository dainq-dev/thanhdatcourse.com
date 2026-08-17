"use client";

import { useState } from "react";
import type { TemplateMeta } from "@/lib/layout-engine";
import { PAGE_CONFIGS } from "@/lib/layout-engine";
import styles from "./LayoutWizard.module.scss";

interface Props {
  template: TemplateMeta;
  engines: Record<string, string>;
  onSave: () => Promise<void>;
  page?: string;
}

const CONTENT_LABELS: Record<string, string> = {
  courses: "Khóa học",
  portfolios: "Dự án",
  products: "Công cụ",
};

export function StepActions({ template, engines, onSave, page }: Props) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className={styles.stepTitle}>
        Bước 3: Xem trước & Lưu
        {page && (
          <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: 8 }}>
            — {PAGE_CONFIGS[page]?.label ?? page}
          </span>
        )}
      </p>
      <div className={styles.summary}>
        <p>
          Bố cục: <strong>{template.label}</strong>
        </p>
        {Object.entries(engines).map(([ct, eng]) => (
          <p key={ct}>
            Kiểu {CONTENT_LABELS[ct] || ct}: <strong>{eng}</strong>
          </p>
        ))}
      </div>
      <p className={styles.previewHint}>
        Bản xem trước bên phải đã cập nhật. Nhấn Lưu để áp dụng cho website.
      </p>
      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving}
        type="button"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
