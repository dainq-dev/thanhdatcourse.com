"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function BrandLogosForm({ config, onChange }: Props) {
  const logos =
    (config.logos as Array<{
      type: string;
      image_url: string;
      alt: string;
      text: string;
    }>) ?? [];

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const addLogo = () => {
    update("logos", [
      ...logos,
      { type: "image", image_url: "", alt: "", text: "" },
    ]);
  };

  const removeLogo = (index: number) => {
    update(
      "logos",
      logos.filter((_, i) => i !== index),
    );
  };

  const updateLogo = (index: number, field: string, value: string) => {
    const next = logos.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    update("logos", next);
  };

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Title</label>
        <input
          className={s.input}
          value={(config.title as string) ?? ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="VD: Thương hiệu hợp tác"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Trusted badge URL</label>
        <MediaTrigger
          value={(config.trusted_badge_url as string) ?? ""}
          onSelect={(url) => update("trusted_badge_url", url)}
          showPreview
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Student count title</label>
        <input
          className={s.input}
          value={(config.student_count_title as string) ?? ""}
          onChange={(e) => update("student_count_title", e.target.value)}
          placeholder="VD: 10.000+ học viên"
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
          <label className={s.label}>Logos</label>
          <button type="button" className={s.btnAccentSmall} onClick={addLogo}>
            Thêm
          </button>
        </div>
        {logos.map((logo, i) => (
          <div key={i} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <div className={s.field}>
                <label className={s.label}>Type</label>
                <select
                  className={s.select}
                  value={logo.type ?? "image"}
                  onChange={(e) => updateLogo(i, "type", e.target.value)}
                >
                  <option value="image">Image</option>
                  <option value="text">Text</option>
                </select>
              </div>
              {(logo.type ?? "image") === "image" ? (
                <>
                  <div className={s.field}>
                    <label className={s.label}>Image URL</label>
                    <MediaTrigger
                      value={logo.image_url}
                      onSelect={(url) => updateLogo(i, "image_url", url)}
                      showPreview
                    />
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Alt</label>
                    <input
                      className={s.input}
                      value={logo.alt ?? ""}
                      onChange={(e) => updateLogo(i, "alt", e.target.value)}
                      placeholder="VD: Adobe"
                    />
                  </div>
                </>
              ) : (
                <div className={s.field}>
                  <label className={s.label}>Brand name</label>
                  <input
                    className={s.input}
                    value={logo.text ?? ""}
                    onChange={(e) => updateLogo(i, "text", e.target.value)}
                    placeholder="VD: Adobe"
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeLogo(i)}
            >
              Xóa
            </button>
          </div>
        ))}
        {logos.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có logo nào
          </p>
        )}
      </div>
    </div>
  );
}
