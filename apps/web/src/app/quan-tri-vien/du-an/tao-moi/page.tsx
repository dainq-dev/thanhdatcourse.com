"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ApiError, api } from "@/lib/api";
import { extractYoutubeId, youtubeThumb } from "@/lib/youtube";
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

export default function CreatePortfolioPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

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
      thumbnailUrl: id ? "" : p.thumbnailUrl,
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
      setCreatedId(result.id);
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi tạo");
      setSaving(false);
    }
  };

  const handleBackToList = () => {
    router.push("/quan-tri-vien/du-an");
  };

  const resolvePreviewThumb = (): string | null => {
    if (f.thumbnailUrl) return f.thumbnailUrl;
    if (f.youtubeVideoId) return youtubeThumb(f.youtubeVideoId);
    return null;
  };

  return (
    <div className={styles.page}>
      {/* LEFT: Form Editor */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h1 className={styles.panelTitle}>
            {createdId ? "Đã tạo dự án" : "Tạo dự án mới"}
          </h1>
          <div className={styles.panelBtns}>
            <button
              type="button"
              className={styles.cBtn}
              onClick={handleBackToList}
            >
              {createdId ? "Về danh sách" : "Hủy"}
            </button>
            {!createdId && (
              <button
                type="submit"
                form="create-portfolio-form"
                className={styles.sBtn}
                disabled={saving}
              >
                {saving ? "Đang tạo..." : "Tạo dự án"}
              </button>
            )}
            {createdId && (
              <button
                type="button"
                className={styles.sBtn}
                onClick={() => router.push(`/quan-tri-vien/du-an/${createdId}`)}
              >
                Chỉnh sửa tiếp
              </button>
            )}
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

        {createdId ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--admin-success)"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className={styles.successText}>Dự án đã được tạo thành công</p>
            <p className={styles.successHint}>
              Bạn có thể chỉnh sửa thêm hoặc quay về danh sách
            </p>
          </div>
        ) : (
          <div className={styles.content}>
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
                  <span className={styles.lbl}>
                    Tiêu đề <span className={styles.req}>*</span>
                  </span>
                  <input
                    type="text"
                    className={styles.inp}
                    value={f.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    required
                    placeholder="Nhập tiêu đề dự án"
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
                  placeholder="Mô tả ngắn về dự án"
                />
              </div>

              <div className={styles.divider} />
              <span className={styles.sectionLbl}>Embed Video</span>

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

              <div className={styles.divider} />
              <span className={styles.sectionLbl}>Hiển thị trang chủ</span>

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
                <input
                  type="number"
                  className={styles.inp}
                  value={f.featuredOrder}
                  onChange={(e) =>
                    onChange("featuredOrder", parseInt(e.target.value, 10) || 0)
                  }
                  min={0}
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* RIGHT: Live Preview */}
      <div className={styles.preview}>
        <div className={styles.previewHead}>
          <span className={styles.previewBadge}>Xem trước</span>
          <span className={styles.previewHint}>trang thực tế</span>
        </div>
        <div className={styles.previewBody}>
          <div className={styles.previewCard}>
            {resolvePreviewThumb() ? (
              (() => {
                const thumb = resolvePreviewThumb();
                return (
                  <img
                    src={thumb ?? ""}
                    alt={f.title || "Preview"}
                    className={styles.previewImg}
                  />
                );
              })()
            ) : (
              <div className={styles.previewPlaceholder}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity="0.3"
                >
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                  <polygon points="10,8 16,12 10,16" fill="currentColor" />
                </svg>
              </div>
            )}
            <span className={styles.previewCat}>
              {f.category || "Danh mục"}
            </span>
            <h2 className={styles.previewTitle}>
              {f.title || "Tiêu đề dự án"}
            </h2>
            {f.description && (
              <p className={styles.previewDesc}>{f.description}</p>
            )}
            <div className={styles.previewActions}>
              {f.youtubeVideoId && (
                <span className={styles.previewCta}>Xem trên YouTube</span>
              )}
              {f.fullVideoUrl && (
                <span className={styles.previewCta2}>Xem video đầy đủ</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
