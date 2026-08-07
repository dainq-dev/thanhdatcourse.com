"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function CountdownOfferForm({ config, onChange }: Props) {
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
          placeholder="VD: Ưu đãi đặc biệt"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Title highlight</label>
        <input
          className={s.input}
          value={(config.title_highlight as string) ?? ""}
          onChange={(e) => update("title_highlight", e.target.value)}
          placeholder="VD: Giảm 40%"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Banner URL</label>
        <MediaTrigger
          value={(config.banner_url as string) ?? ""}
          onSelect={(url) => update("banner_url", url)}
          showPreview
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Current price (VND)</label>
        <input
          className={s.input}
          type="number"
          value={String(config.current_price ?? 996000)}
          onChange={(e) => update("current_price", Number(e.target.value) || 0)}
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Original price (VND)</label>
        <input
          className={s.input}
          type="number"
          value={String(config.original_price ?? 15472000)}
          onChange={(e) =>
            update("original_price", Number(e.target.value) || 0)
          }
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Bonus count</label>
        <input
          className={s.input}
          type="number"
          value={String(config.bonus_count ?? 5)}
          onChange={(e) => update("bonus_count", Number(e.target.value) || 0)}
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
          placeholder="VD: #register"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Countdown seconds</label>
        <input
          className={s.input}
          type="number"
          value={String(config.countdown_seconds ?? 7140)}
          onChange={(e) =>
            update("countdown_seconds", Number(e.target.value) || 0)
          }
        />
      </div>
    </div>
  );
}
