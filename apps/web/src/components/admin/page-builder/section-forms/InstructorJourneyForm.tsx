"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

interface Stat {
  value: string;
  label: string;
}

interface BrandImage {
  image_url: string;
  alt: string;
}

export function InstructorJourneyForm({ config, onChange }: Props) {
  const stats = (config.stats as Stat[]) ?? [];
  const brandStrip = (config.brand_strip as BrandImage[]) ?? [];

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const addStat = () => {
    update("stats", [...stats, { value: "", label: "" }]);
  };

  const removeStat = (index: number) => {
    update(
      "stats",
      stats.filter((_, i) => i !== index),
    );
  };

  const updateStat = (index: number, field: string, value: string) => {
    const next = stats.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    );
    update("stats", next);
  };

  const addBrandImage = () => {
    update("brand_strip", [...brandStrip, { image_url: "", alt: "" }]);
  };

  const removeBrandImage = (index: number) => {
    update(
      "brand_strip",
      brandStrip.filter((_, i) => i !== index),
    );
  };

  const updateBrandImage = (index: number, field: string, value: string) => {
    const next = brandStrip.map((b, i) =>
      i === index ? { ...b, [field]: value } : b,
    );
    update("brand_strip", next);
  };

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Portrait URL</label>
        <MediaTrigger
          value={(config.portrait_url as string) ?? ""}
          onSelect={(url) => update("portrait_url", url)}
          showPreview
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Title</label>
        <input
          className={s.input}
          value={(config.title as string) ?? ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="VD: Hành trình giảng viên"
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
          <label className={s.label}>Stats</label>
          <button type="button" className={s.btnAccentSmall} onClick={addStat}>
            Thêm
          </button>
        </div>
        {stats.map((stat, i) => (
          <div key={i} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <input
                className={s.input}
                value={stat.value ?? ""}
                onChange={(e) => updateStat(i, "value", e.target.value)}
                placeholder="VD: 10+"
              />
              <input
                className={s.input}
                value={stat.label ?? ""}
                onChange={(e) => updateStat(i, "label", e.target.value)}
                placeholder="VD: Năm kinh nghiệm"
              />
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeStat(i)}
            >
              Xóa
            </button>
          </div>
        ))}
        {stats.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có stat nào
          </p>
        )}
      </div>

      <div className={s.field}>
        <label className={s.label}>Story (HTML)</label>
        <textarea
          className={s.textarea}
          style={{ minHeight: "150px" }}
          value={(config.story_html as string) ?? ""}
          onChange={(e) => update("story_html", e.target.value)}
          placeholder="<p>Câu chuyện hành trình...</p>"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>CTA Text</label>
        <input
          className={s.input}
          value={(config.cta_text as string) ?? ""}
          onChange={(e) => update("cta_text", e.target.value)}
          placeholder="VD: Xem thêm"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>CTA URL</label>
        <input
          className={s.input}
          value={(config.cta_url as string) ?? ""}
          onChange={(e) => update("cta_url", e.target.value)}
          placeholder="VD: #about"
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
          <label className={s.label}>Brand strip</label>
          <button
            type="button"
            className={s.btnAccentSmall}
            onClick={addBrandImage}
          >
            Thêm
          </button>
        </div>
        {brandStrip.map((brand, i) => (
          <div key={i} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <div className={s.field}>
                <label className={s.label}>Image URL</label>
                <MediaTrigger
                  value={brand.image_url}
                  onSelect={(url) => updateBrandImage(i, "image_url", url)}
                  showPreview
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Alt</label>
                <input
                  className={s.input}
                  value={brand.alt ?? ""}
                  onChange={(e) => updateBrandImage(i, "alt", e.target.value)}
                  placeholder="VD: Adobe"
                />
              </div>
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeBrandImage(i)}
            >
              Xóa
            </button>
          </div>
        ))}
        {brandStrip.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có ảnh nào
          </p>
        )}
      </div>

      <div className={s.field}>
        <label className={s.label}>Background</label>
        <select
          className={s.select}
          value={(config.background as string) ?? "white"}
          onChange={(e) => update("background", e.target.value)}
        >
          <option value="white">White</option>
          <option value="soft">Soft</option>
        </select>
      </div>
    </div>
  );
}
