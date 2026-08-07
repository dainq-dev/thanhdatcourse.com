"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function SalesStoryForm({ config, onChange }: Props) {
  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Title</label>
        <input
          className={s.input}
          value={(config.title as string) ?? ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="VD: Câu chuyện của chúng tôi"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Content (HTML)</label>
        <textarea
          className={s.textarea}
          style={{ minHeight: "200px" }}
          value={(config.content_html as string) ?? ""}
          onChange={(e) => update("content_html", e.target.value)}
          placeholder="<p>Câu chuyện...</p>"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Image left URL</label>
        <MediaTrigger
          value={(config.image_left_url as string) ?? ""}
          onSelect={(url) => update("image_left_url", url)}
          showPreview
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Image right URL</label>
        <MediaTrigger
          value={(config.image_right_url as string) ?? ""}
          onSelect={(url) => update("image_right_url", url)}
          showPreview
        />
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
