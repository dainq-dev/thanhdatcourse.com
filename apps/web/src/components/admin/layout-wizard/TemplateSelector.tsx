"use client";

import { PageSkeleton } from "./skeletons/PageSkeleton";
import type { TemplateMeta } from "@/lib/layout-engine";
import styles from "./LayoutWizard.module.scss";

interface Props {
  templates: Record<string, TemplateMeta>;
  value: string;
  engines: Record<string, string>;
  onChange: (id: string) => void;
}

export function TemplateSelector({ templates, value, engines, onChange }: Props) {
  const list = Object.values(templates);
  return (
    <div>
      <p className={styles.stepTitle}>Bước 1: Chọn bố cục trang</p>
      <p className={styles.stepDesc}>Chọn cách sắp xếp các phần trên trang</p>
      <div className={styles.templateGrid}>
        {list.map((t) => (
          <button
            key={t.id}
            className={`${styles.templateCard} ${value === t.id ? styles.templateActive : ""}`}
            onClick={() => onChange(t.id)}
            type="button"
          >
            <PageSkeleton template={t} engines={engines} />
            <span className={styles.templateName}>{t.label}</span>
            <span className={styles.templateDesc}>{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
