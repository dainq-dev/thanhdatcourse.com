"use client";

import { formatVND } from "@workspace/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ApiError, api } from "@/lib/api";
import { extractYoutubeId, youtubeThumb } from "@/lib/youtube";
import styles from "./page.module.scss";

const TAG_OPTIONS = ["LUT", "Preset"];

export default function CreatePresetLutPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState("");

  const [f, setF] = useState({
    title: "",
    description: "",
    price: 0,
    tag: "LUT",
    thumbnailUrl: "",
    youtubePreviewId: "",
    externalCheckoutUrl: "",
    isPublished: true,
    isFeaturedOnHome: false,
  });

  const onChange = (k: string, v: string | boolean | number) => {
    setF((p) => ({ ...p, [k]: v }));
  };

  const onYoutubeChange = (input: string) => {
    const id = extractYoutubeId(input);
    setF((p) => ({
      ...p,
      youtubePreviewId: id,
      thumbnailUrl: id ? "" : p.thumbnailUrl,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const effectiveTag = customTag.trim() || f.tag;
      const result = await api.post<{ id: string }>("/api/products", {
        title: f.title,
        description: f.description || undefined,
        price: f.price,
        thumbnailUrl: f.thumbnailUrl || undefined,
        youtubePreviewId: f.youtubePreviewId || undefined,
        externalCheckoutUrl: f.externalCheckoutUrl || undefined,
        tag: effectiveTag || undefined,
        isPublished: f.isPublished,
        isFeaturedOnHome: f.isFeaturedOnHome,
      });
      setCreatedId(result.id);
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi tạo");
      setSaving(false);
    }
  };

  const handleBackToList = () => {
    router.push("/quan-tri-vien/presets-luts");
  };

  const resolvePreviewThumb = (): string | null => {
    if (f.thumbnailUrl) return f.thumbnailUrl;
    if (f.youtubePreviewId) return youtubeThumb(f.youtubePreviewId);
    return null;
  };

  const effectiveTag = customTag.trim() || f.tag;

  return (
    <div className={styles.page}>
      {/* LEFT: Form Editor */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h1 className={styles.panelTitle}>
            {createdId ? "Đã tạo sản phẩm" : "Tạo sản phẩm mới"}
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
                form="create-product-form"
                className={styles.sBtn}
                disabled={saving}
              >
                {saving ? "Đang tạo..." : "Tạo sản phẩm"}
              </button>
            )}
            {createdId && (
              <button
                type="button"
                className={styles.sBtn}
                onClick={() =>
                  router.push(`/quan-tri-vien/presets-luts/${createdId}`)
                }
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
            <p className={styles.successText}>
              Sản phẩm đã được tạo thành công
            </p>
            <p className={styles.successHint}>
              Bạn có thể chỉnh sửa thêm hoặc quay về danh sách
            </p>
          </div>
        ) : (
          <div className={styles.content}>
            <form id="create-product-form" onSubmit={submit}>
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
                    placeholder="Nhập tiêu đề sản phẩm"
                  />
                </div>
                <div className={styles.fld}>
                  <span className={styles.lbl}>
                    Giá (VND) <span className={styles.req}>*</span>
                  </span>
                  <input
                    type="number"
                    className={styles.inp}
                    value={f.price}
                    onChange={(e) =>
                      onChange("price", parseInt(e.target.value, 10) || 0)
                    }
                    required
                    min={0}
                    placeholder="Ví dụ: 299000"
                  />
                </div>
              </div>

              <div className={styles.r}>
                <div className={styles.fld}>
                  <span className={styles.lbl}>Tag</span>
                  <select
                    className={styles.sel}
                    value={f.tag}
                    onChange={(e) => onChange("tag", e.target.value)}
                  >
                    {TAG_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.fld}>
                  <span className={styles.lbl}>Tag tùy chỉnh (ghi đè)</span>
                  <input
                    type="text"
                    className={styles.inp}
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Để trống để dùng tag mặc định"
                  />
                  <span className={styles.hint}>
                    Nhập tag khác nếu cần. Để trống sẽ dùng tag đã chọn bên
                    trên.
                  </span>
                </div>
              </div>

              <div className={styles.fld}>
                <span className={styles.lbl}>Mô tả</span>
                <textarea
                  className={styles.txa}
                  value={f.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  rows={3}
                  placeholder="Mô tả ngắn về sản phẩm"
                />
              </div>

              <div className={styles.divider} />
              <span className={styles.sectionLbl}>Video &amp; thanh toán</span>

              <div className={styles.fld}>
                <span className={styles.lbl}>Video YouTube</span>
                <input
                  type="text"
                  className={styles.inp}
                  value={f.youtubePreviewId}
                  onChange={(e) => onYoutubeChange(e.target.value)}
                  placeholder="https://youtu.be/... hoặc paste ID"
                />
                <span className={styles.hint}>
                  Tự động trích xuất ID từ link YouTube
                </span>
              </div>

              <div className={styles.fld}>
                <span className={styles.lbl}>Link thanh toán (tuỳ chọn)</span>
                <input
                  type="text"
                  className={styles.inp}
                  value={f.externalCheckoutUrl}
                  onChange={(e) =>
                    onChange("externalCheckoutUrl", e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>

              <div className={styles.divider} />
              <span className={styles.sectionLbl}>Hiển thị</span>

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
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={f.isPublished}
                    onChange={(e) => onChange("isPublished", e.target.checked)}
                  />
                  <span>Xuất bản</span>
                </label>
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
            {effectiveTag && (
              <span className={styles.previewCat}>{effectiveTag}</span>
            )}
            <h2 className={styles.previewTitle}>
              {f.title || "Tiêu đề sản phẩm"}
            </h2>
            <p className={styles.previewPrice}>
              {f.price ? formatVND(f.price) : "0 ₫"}
            </p>
            {f.description && (
              <p className={styles.previewDesc}>{f.description}</p>
            )}
            <span className={styles.previewCta}>Mua ngay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
