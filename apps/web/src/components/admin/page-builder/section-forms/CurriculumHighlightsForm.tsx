"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

interface Item {
  number: string;
  title: string;
  description_html: string;
  image_url: string;
}

export function CurriculumHighlightsForm({ config, onChange }: Props) {
  const items = (config.items as Item[]) ?? [];

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const addItem = () => {
    update("items", [
      ...items,
      { number: "", title: "", description_html: "", image_url: "" },
    ]);
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
        <label className={s.label}>Section title</label>
        <input
          className={s.input}
          value={(config.section_title as string) ?? ""}
          onChange={(e) => update("section_title", e.target.value)}
          placeholder="VD: Điểm nổi bật trong chương trình"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Section subtitle</label>
        <input
          className={s.input}
          value={(config.section_subtitle as string) ?? ""}
          onChange={(e) => update("section_subtitle", e.target.value)}
          placeholder="VD: 20+ bài tập thực hành"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Section subtitle highlight</label>
        <input
          className={s.input}
          value={(config.section_subtitle_highlight as string) ?? ""}
          onChange={(e) => update("section_subtitle_highlight", e.target.value)}
          placeholder="VD: Kèm video hướng dẫn"
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
                <label className={s.label}>Number</label>
                <input
                  className={s.input}
                  value={item.number ?? ""}
                  onChange={(e) => updateItem(i, "number", e.target.value)}
                  placeholder="VD: 01"
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Title</label>
                <input
                  className={s.input}
                  value={item.title ?? ""}
                  onChange={(e) => updateItem(i, "title", e.target.value)}
                  placeholder="VD: Thiết kế UI/UX"
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Description (HTML)</label>
                <textarea
                  className={s.textarea}
                  value={item.description_html ?? ""}
                  onChange={(e) =>
                    updateItem(i, "description_html", e.target.value)
                  }
                  placeholder="VD: <p>Học cách thiết kế...</p>"
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Image URL</label>
                <MediaTrigger
                  value={item.image_url ?? ""}
                  onSelect={(url) => updateItem(i, "image_url", url)}
                  showPreview
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
            Chưa có item nào
          </p>
        )}
      </div>
    </div>
  );
}
