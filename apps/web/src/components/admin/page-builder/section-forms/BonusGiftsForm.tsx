"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

interface Item {
  title: string;
  title_highlight: string;
  description_html: string;
  image_url: string;
  strikethrough_price?: string;
}

export function BonusGiftsForm({ config, onChange }: Props) {
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
      {
        title: "",
        title_highlight: "",
        description_html: "",
        image_url: "",
        strikethrough_price: "",
      },
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
          placeholder="VD: Quà tặng ưu đãi"
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
                <label className={s.label}>Title</label>
                <input
                  className={s.input}
                  value={item.title ?? ""}
                  onChange={(e) => updateItem(i, "title", e.target.value)}
                  placeholder="VD: Ebook thiết kế"
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Title highlight</label>
                <input
                  className={s.input}
                  value={item.title_highlight ?? ""}
                  onChange={(e) =>
                    updateItem(i, "title_highlight", e.target.value)
                  }
                  placeholder="VD: Trị giá 500K"
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
                  placeholder="VD: <p>Miễn phí khi đăng ký...</p>"
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
              <div className={s.field}>
                <label className={s.label}>Strikethrough price</label>
                <input
                  className={s.input}
                  value={item.strikethrough_price ?? ""}
                  onChange={(e) =>
                    updateItem(i, "strikethrough_price", e.target.value)
                  }
                  placeholder="VD: 500.000đ"
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
