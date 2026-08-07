"use client";

import { useCallback } from "react";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

interface Item {
  question: string;
  answer_html: string;
}

export function FAQAccordionForm({ config, onChange }: Props) {
  const items = (config.items as Item[]) ?? [];

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const addItem = () => {
    update("items", [...items, { question: "", answer_html: "" }]);
  };

  const removeItem = (index: number) => {
    update(
      "items",
      items.filter((_, i) => i !== index),
    );
  };

  const updateItem = (index: number, field: string, value: string) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    update("items", next);
  };

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Title</label>
        <input
          className={s.input}
          value={(config.title as string) ?? ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="VD: Câu hỏi thường gặp"
        />
      </div>

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
              <div className={s.field}>
                <label className={s.label}>Question</label>
                <input
                  className={s.input}
                  value={item.question ?? ""}
                  onChange={(e) => updateItem(i, "question", e.target.value)}
                  placeholder="VD: Khóa học dành cho ai?"
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Answer (HTML)</label>
                <textarea
                  className={s.textarea}
                  value={item.answer_html ?? ""}
                  onChange={(e) => updateItem(i, "answer_html", e.target.value)}
                  placeholder="<p>Câu trả lời...</p>"
                />
              </div>
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
            Chưa có câu hỏi nào
          </p>
        )}
      </div>
    </div>
  );
}
