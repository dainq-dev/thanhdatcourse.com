"use client";

import { formatVND } from "@workspace/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";
import { ApiError, api } from "@/lib/api";
import { extractYoutubeId, youtubeThumb } from "@/lib/youtube";
import styles from "./page.module.scss";

const TAG_OPTIONS = ["LUT", "Preset"];

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  thumbnailUrl?: string;
  youtubePreviewId?: string;
  externalCheckoutUrl?: string;
  tag?: string;
  isPublished: number;
  isFeaturedOnHome: number;
}

export default function EditPresetLutPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pvKey, setPvKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved",
  );

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

  useEffect(() => {
    (async () => {
      try {
        const item = await api.get<Product>(`/api/products/${id}`);
        setF({
          title: item.title,
          description: item.description || "",
          price: item.price || 0,
          tag: item.tag || "LUT",
          thumbnailUrl: item.thumbnailUrl || "",
          youtubePreviewId: item.youtubePreviewId || "",
          externalCheckoutUrl: item.externalCheckoutUrl || "",
          isPublished: item.isPublished === 1,
          isFeaturedOnHome: item.isFeaturedOnHome === 1,
        });
        if (item.tag && !TAG_OPTIONS.includes(item.tag)) {
          setCustomTag(item.tag);
        }
      } catch {
        setError("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (k: string, v: string | boolean | number) => {
    setF((p) => ({ ...p, [k]: v }));
    setSaveStatus("unsaved");
  };

  const onYoutubeChange = (input: string) => {
    const yid = extractYoutubeId(input);
    setF((p) => ({
      ...p,
      youtubePreviewId: yid,
      thumbnailUrl: yid ? "" : p.thumbnailUrl,
    }));
    setSaveStatus("unsaved");
  };

  useEffect(() => {
    if (loading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (saveStatus !== "unsaved") return;
      setSaveStatus("saving");
      try {
        const effectiveTag = customTag.trim() || f.tag;
        await api.put(`/api/products/${id}`, {
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
        setSaveStatus("saved");
        setPvKey((k) => k + 1);
      } catch {
        setSaveStatus("unsaved");
      }
    }, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [f, customTag]);

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setSaving(true);
    try {
      const effectiveTag = customTag.trim() || f.tag;
      await api.put(`/api/products/${id}`, {
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
      setSaveStatus("saved");
      setPvKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.del(`/api/products/${id}`);
      router.push("/quan-tri-vien/presets-luts");
    } catch {
      setError("Không thể xóa sản phẩm");
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const resolvePreviewThumb = (): string | null => {
    if (f.thumbnailUrl) return f.thumbnailUrl;
    if (f.youtubePreviewId) return youtubeThumb(f.youtubePreviewId);
    return null;
  };

  const effectiveTag = customTag.trim() || f.tag;

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* LEFT: Editor */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h1 className={styles.panelTitle}>Chỉnh sửa sản phẩm</h1>
          <div className={styles.panelBtns}>
            <span className={styles.statusBadge}>
              {saveStatus === "saved"
                ? "Đã lưu"
                : saveStatus === "saving"
                  ? "Đang lưu..."
                  : "Chưa lưu"}
            </span>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => setConfirmOpen(true)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Xóa
            </button>
            <button
              type="button"
              className={styles.cBtn}
              onClick={() => router.push("/quan-tri-vien/presets-luts")}
            >
              Quay lại danh sách
            </button>
            <button
              type="button"
              className={styles.sBtn}
              onClick={() => save()}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu"}
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
        <div className={styles.content}>
          <form onSubmit={save}>
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
                  onChange={(e) => {
                    setCustomTag(e.target.value);
                    setSaveStatus("unsaved");
                  }}
                  placeholder="Để trống để dùng tag mặc định"
                />
                <span className={styles.hint}>
                  Nhập tag khác nếu cần. Để trống sẽ dùng tag đã chọn bên trên.
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
      </div>

      {/* RIGHT: Live Preview */}
      <div className={styles.preview}>
        <div className={styles.previewHead}>
          <span className={styles.previewBadge}>Xem trước</span>
          <span className={styles.previewHint}>trang thực tế</span>
          <button
            type="button"
            className={styles.previewReload}
            onClick={() => {
              save();
              setTimeout(() => setPvKey((k) => k + 1), 500);
            }}
            title="Lưu & tải lại preview"
          >
            Lưu &amp; Tải lại
          </button>
        </div>
        <div className={styles.previewBody}>
          <div className={styles.previewCard}>
            {f.youtubePreviewId ? (
              <div className={styles.previewVideoWrap}>
                <iframe
                  src={`https://www.youtube.com/embed/${f.youtubePreviewId}`}
                  title={f.title}
                  className={styles.previewVideo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : resolvePreviewThumb() ? (
              (() => {
                const thumb = resolvePreviewThumb();
                return (
                  <img
                    src={thumb ?? ""}
                    alt={f.title}
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
            <span className={styles.previewCat}>{effectiveTag}</span>
            <h2 className={styles.previewTitle}>{f.title}</h2>
            <p className={styles.previewPrice}>
              {f.price ? formatVND(f.price) : "0 ₫"}
            </p>
            {f.description && (
              <p className={styles.previewDesc}>{f.description}</p>
            )}
            <div className={styles.previewActions}>
              {f.externalCheckoutUrl && (
                <span className={styles.previewCta}>Mua ngay</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa sản phẩm"
        message={`Bạn có chắc muốn xóa sản phẩm "${f.title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
