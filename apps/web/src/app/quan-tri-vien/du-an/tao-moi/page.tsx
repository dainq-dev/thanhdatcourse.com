"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ApiError, api } from "@/lib/api";
import styles from "./page.module.scss";

const CATEGORIES = [
  "Travel",
  "TVC",
  "Documentary",
  "Tutorial",
  "Automotive",
  "Food",
  "Fashion",
  "Short Video",
];

function extractYoutubeId(input: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1] ?? input;
  }
  return input;
}

export default function CreatePortfolioPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [f, setF] = useState({
    title: "",
    description: "",
    category: "Travel",
    thumbnailUrl: "",
    fullVideoUrl: "",
    youtubeVideoId: "",
    isFeaturedOnHome: false,
    featuredOrder: 0,
  });

  const onChange = (k: string, v: string | boolean | number) => {
    setF((p) => ({ ...p, [k]: v }));
  };

  const onYoutubeChange = (input: string) => {
    const id = extractYoutubeId(input);
    setF((p) => ({
      ...p,
      youtubeVideoId: id,
      thumbnailUrl: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : p.thumbnailUrl,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const result = await api.post<{ id: string }>("/api/portfolios", {
        title: f.title,
        description: f.description || undefined,
        category: f.category,
        thumbnailUrl: f.thumbnailUrl || undefined,
        fullVideoUrl: f.fullVideoUrl || undefined,
        youtubeVideoId: f.youtubeVideoId || undefined,
        isFeaturedOnHome: f.isFeaturedOnHome,
        featuredOrder: f.featuredOrder,
      });
      router.push(`/quan-tri-vien/du-an/${result.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi tạo",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.headTitle}>Tạo dự án mới</h1>
        <div className={styles.headBtns}>
          <button
            type="button"
            className={styles.cBtn}
            onClick={() => router.back()}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="create-portfolio-form"
            className={styles.sBtn}
            disabled={saving}
          >
            {saving ? "Đang tạo..." : "Tạo dự án"}
          </button>
        </div>
      </div>
      {error && (
        <div className={styles.err}>
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            className={styles.errX}
          >
            ✕
          </button>
        </div>
      )}
      <div className={styles.card}>
        <form id="create-portfolio-form" onSubmit={submit}>
          <div className={styles.fld}>
            <span className={styles.lbl}>Ảnh thumbnail</span>
            <MediaTrigger
              onSelect={(url) => onChange("thumbnailUrl", url)}
              value={f.thumbnailUrl}
              showPreview
              filter="image"
              accept="image/*"
            >
              {f.thumbnailUrl ? "Đổi ảnh" : "Chọn ảnh thumbnail"}
            </MediaTrigger>
          </div>

          <div className={styles.r}>
            <div className={styles.fld}>
              <span className={styles.lbl}>Tiêu đề <span className={styles.req}>*</span></span>
              <input
                type="text"
                className={styles.inp}
                value={f.title}
                onChange={(e) => onChange("title", e.target.value)}
                required
              />
            </div>
            <div className={styles.fld}>
              <span className={styles.lbl}>Danh mục</span>
              <select
                className={styles.sel}
                value={f.category}
                onChange={(e) => onChange("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.fld}>
            <span className={styles.lbl}>Mô tả</span>
            <textarea
              className={styles.txa}
              value={f.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.fld}>
            <span className={styles.lbl}>Video YouTube</span>
            <input
              type="text"
              className={styles.inp}
              value={f.youtubeVideoId}
              onChange={(e) => onYoutubeChange(e.target.value)}
              placeholder="https://youtu.be/... hoặc paste ID"
            />
            <span className={styles.hint}>
              Tự động trích xuất ID từ link YouTube
            </span>
            {f.youtubeVideoId && (
              <img
                src={`https://img.youtube.com/vi/${f.youtubeVideoId}/hqdefault.jpg`}
                alt="YouTube preview"
                className={styles.ytPreview}
              />
            )}
          </div>

          <div className={styles.fld}>
            <span className={styles.lbl}>Link video đầy đủ (tuỳ chọn)</span>
            <input
              type="text"
              className={styles.inp}
              value={f.fullVideoUrl}
              onChange={(e) => onChange("fullVideoUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className={styles.toggles}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={f.isFeaturedOnHome}
                onChange={(e) =>
                  onChange("isFeaturedOnHome", e.target.checked)
                }
              />
              <span>Nổi bật trang chủ</span>
            </label>
          </div>
          <div className={styles.fld}>
            <span className={styles.lbl}>Thứ tự nổi bật</span>
            <input type="number" className={styles.inp} value={f.featuredOrder} onChange={e => onChange("featuredOrder", parseInt(e.target.value) || 0)} min={0} />
          </div>
        </form>
      </div>
    </div>
  );
}
