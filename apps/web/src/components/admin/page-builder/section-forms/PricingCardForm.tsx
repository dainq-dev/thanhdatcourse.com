"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

interface Feature {
  text: string;
  bold: boolean;
}

export function PricingCardForm({ config, onChange }: Props) {
  const features = (config.features as Feature[]) ?? [];

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const addFeature = () => {
    update("features", [...features, { text: "", bold: false }]);
  };

  const removeFeature = (index: number) => {
    update(
      "features",
      features.filter((_, i) => i !== index),
    );
  };

  const updateFeature = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    const next = features.map((f, i) =>
      i === index ? { ...f, [field]: value } : f,
    );
    update("features", next);
  };

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Card image URL</label>
        <MediaTrigger
          value={(config.card_image_url as string) ?? ""}
          onSelect={(url) => update("card_image_url", url)}
          showPreview
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Title</label>
        <input
          className={s.input}
          value={(config.title as string) ?? ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="VD: Gói PRO"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Price text</label>
        <input
          className={s.input}
          value={(config.price_text as string) ?? ""}
          onChange={(e) => update("price_text", e.target.value)}
          placeholder="VD: 2.990.000đ"
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
          <label className={s.label}>Features</label>
          <button
            type="button"
            className={s.btnAccentSmall}
            onClick={addFeature}
          >
            Thêm
          </button>
        </div>
        {features.map((feature, i) => (
          <div key={i} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <input
                className={s.input}
                value={feature.text ?? ""}
                onChange={(e) => updateFeature(i, "text", e.target.value)}
                placeholder="VD: Truy cập trọn đời"
              />
              <label className={s.toggle}>
                <input
                  type="checkbox"
                  checked={feature.bold ?? false}
                  onChange={(e) => updateFeature(i, "bold", e.target.checked)}
                />
                <span>In đậm</span>
              </label>
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeFeature(i)}
            >
              Xóa
            </button>
          </div>
        ))}
        {features.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có feature nào
          </p>
        )}
      </div>

      <div className={s.field}>
        <label className={s.label}>CTA Text</label>
        <input
          className={s.input}
          value={(config.cta_text as string) ?? ""}
          onChange={(e) => update("cta_text", e.target.value)}
          placeholder="VD: Đăng ký ngay"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>CTA URL</label>
        <input
          className={s.input}
          value={(config.cta_url as string) ?? ""}
          onChange={(e) => update("cta_url", e.target.value)}
          placeholder="VD: #register"
        />
      </div>
    </div>
  );
}
