"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function HeroBannerForm({ config, onChange }: Props) {
  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Badge text</label>
        <input
          className={s.input}
          value={(config.badge_text as string) ?? ""}
          onChange={(e) => update("badge_text", e.target.value)}
          placeholder="VD: Ưu đãi đặc biệt"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Badge subtitle</label>
        <input
          className={s.input}
          value={(config.badge_subtitle as string) ?? ""}
          onChange={(e) => update("badge_subtitle", e.target.value)}
          placeholder="VD: Chỉ còn 24h"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Title</label>
        <input
          className={s.input}
          value={(config.title as string) ?? ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="VD: Khóa học Photoshop Master"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Subtitle</label>
        <input
          className={s.input}
          value={(config.subtitle as string) ?? ""}
          onChange={(e) => update("subtitle", e.target.value)}
          placeholder="VD: Từ cơ bản đến chuyên nghiệp"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Subtitle highlight</label>
        <input
          className={s.input}
          value={(config.subtitle_highlight as string) ?? ""}
          onChange={(e) => update("subtitle_highlight", e.target.value)}
          placeholder="VD: Chỉ với 996K"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Video thumbnail URL</label>
        <MediaTrigger
          value={(config.video_thumbnail_url as string) ?? ""}
          onSelect={(url) => update("video_thumbnail_url", url)}
          showPreview
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Video YouTube URL</label>
        <input
          className={s.input}
          value={(config.video_youtube_url as string) ?? ""}
          onChange={(e) => update("video_youtube_url", e.target.value)}
          placeholder="VD: https://youtube.com/watch?v=..."
        />
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
          placeholder="VD: #pricing"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Note text</label>
        <input
          className={s.input}
          value={(config.note_text as string) ?? ""}
          onChange={(e) => update("note_text", e.target.value)}
          placeholder="VD: * Áp dụng đến hết ngày..."
        />
      </div>
    </div>
  );
}
