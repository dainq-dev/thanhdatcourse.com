"use client";

import { COURSE_ENGINE_META, PORTFOLIO_ENGINE_META, PRODUCT_ENGINE_META } from "@/lib/layout-engine";
import styles from "./LayoutWizard.module.scss";

const ENGINE_REGISTRY = {
  courses: COURSE_ENGINE_META,
  portfolios: PORTFOLIO_ENGINE_META,
  products: PRODUCT_ENGINE_META,
} as const;

const CONTENT_LABELS: Record<string, string> = {
  courses: "Khóa học",
  portfolios: "Dự án",
  products: "Công cụ",
};

const ENGINE_DEFAULTS: Record<string, string> = {
  courses: "grid",
  portfolios: "stacked",
  products: "grid",
};

interface Props {
  contentTypeEngines: string[];
  values: Record<string, string>;
  onChange: (contentType: string, engineId: string) => void;
}

export function EngineSelector({ contentTypeEngines, values, onChange }: Props) {
  return (
    <div>
      <p className={styles.stepTitle}>Bước 2: Kiểu hiển thị nội dung</p>
      <p className={styles.stepDesc}>
        Chọn cách hiển thị cho từng loại nội dung trong trang
      </p>
      {contentTypeEngines.map((ct) => {
        const meta = ENGINE_REGISTRY[ct as keyof typeof ENGINE_REGISTRY];
        if (!meta) return null;
        const current = values[ct] || ENGINE_DEFAULTS[ct] || "grid";
        return (
          <div key={ct} className={styles.engineRow}>
            <label className={styles.engineLabel}>{CONTENT_LABELS[ct]}</label>
            <select
              className={styles.engineSelect}
              value={current}
              onChange={(e) => onChange(ct, e.target.value)}
            >
              {Object.values(meta).map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
