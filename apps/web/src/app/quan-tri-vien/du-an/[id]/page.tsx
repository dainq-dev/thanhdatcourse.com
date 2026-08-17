"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";
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

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  fullVideoUrl?: string;
  youtubeVideoId?: string;
  isFeaturedOnHome: number;
  featuredOrder: number;
}

export default function EditPortfolioPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pvKey, setPvKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved",
  );

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

  useEffect(() => {
    (async () => {
      try {
        const item = await api.get<Portfolio>(`/api/portfolios/${id}`);
        setF({
          title: item.title,
          description: item.description || "",
          category: item.category || "Travel",
          thumbnailUrl: item.thumbnailUrl || "",
          fullVideoUrl: item.fullVideoUrl || "",
          youtubeVideoId: item.youtubeVideoId || "",
          isFeaturedOnHome: item.isFeaturedOnHome === 1,
          featuredOrder: item.featuredOrder || 0,
        });
      } catch {
        setError("Không thể tải dự án");
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
      youtubeVideoId: yid,
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
        await api.put(`/api/portfolios/${id}`, {
          title: f.title,
          description: f.description || undefined,
          category: f.category,
          thumbnailUrl: f.thumbnailUrl || undefined,
          fullVideoUrl: f.fullVideoUrl || undefined,
          youtubeVideoId: f.youtubeVideoId || undefined,
          isFeaturedOnHome: f.isFeaturedOnHome,
          featuredOrder: f.featuredOrder,
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
  }, [f]);

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/api/portfolios/${id}`, {
        title: f.title,
        description: f.description || undefined,
        category: f.category,
        thumbnailUrl: f.thumbnailUrl || undefined,
        fullVideoUrl: f.fullVideoUrl || undefined,
        youtubeVideoId: f.youtubeVideoId || undefined,
        isFeaturedOnHome: f.isFeaturedOnHome,
        featuredOrder: f.featuredOrder,
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
      await api.del(`/api/portfolios/${id}`);
      router.push("/quan-tri-vien/du-an");
    } catch {
      setError("Không thể xóa dự án");
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const resolvePreviewThumb = (): string | null => {
    if (f.thumbnailUrl) return f.thumbnailUrl;
    if (f.youtubeVideoId) return youtubeThumb(f.youtubeVideoId);
    return null;
  };

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
          <h1 className={styles.panelTitle}>Chỉnh sửa dự án</h1>
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
              onClick={() => router.push("/quan-tri-vien/du-an")}
            >
              Hủy
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
            Lưu & Tải lại
          </button>
        </div>
        <div className={styles.previewBody}>
          <div className={styles.previewCard}>
            {f.youtubeVideoId ? (
              <div className={styles.previewVideoWrap}>
                <iframe
                  src={`https://www.youtube.com/embed/${f.youtubeVideoId}`}
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
            <span className={styles.previewCat}>{f.category}</span>
            <h2 className={styles.previewTitle}>{f.title}</h2>
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

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa dự án"
        message={`Bạn có chắc muốn xóa dự án "${f.title}"? Hành động này không thể hoàn tác.`}
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
