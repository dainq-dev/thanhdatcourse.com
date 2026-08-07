"use client";

import { useCallback } from "react";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function TrustBadgesForm({ config, onChange }: Props) {
  const items = (config.items as Array<{ text: string }>) ?? [];

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const addItem = () => {
    update("items", [...items, { text: "" }]);
  };

  const removeItem = (index: number) => {
    update(
      "items",
      items.filter((_, i) => i !== index),
    );
  };

  const updateItem = (index: number, value: string) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, text: value } : item,
    );
    update("items", next);
  };

  return (
    <div className={s.form}>
      <div className={s.arrayField}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label className={s.label}>Items</label>
          <button type="button" className={s.btnAccentSmall} onClick={addItem}>
            Thêm
          </button>
        </div>
        {items.map((item, i) => (
          <div key={i} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <input
                className={s.input}
                value={item.text}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder="VD: KHÔNG CẦN CÓ KINH NGHIỆM"
              />
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeItem(i)}
            >
              Xóa
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có badge nào
          </p>
        )}
      </div>
    </div>
  );
}
