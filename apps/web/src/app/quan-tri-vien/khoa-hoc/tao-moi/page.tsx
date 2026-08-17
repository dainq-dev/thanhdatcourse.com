"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ApiError, api } from "@/lib/api";
import styles from "./page.module.scss";

function slugify(t: string) {
  return t
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [f, setF] = useState({
    title: "",
    slug: "",
    description: "",
    basePrice: "",
    thumbnailUrl: "",
    trailerVideoUrl: "",
    externalCheckoutUrl: "",
    level: "all" as string,
    buttonText: "",
    isPublished: false,
    isFeaturedOnHome: false,
    isComboOnly: false,
  });

  const onChange = (k: string, v: string | boolean) => {
    if (k === "title" && typeof v === "string") {
      setF((p) => ({ ...p, title: v, slug: slugify(v) }));
    } else {
      setF((p) => ({ ...p, [k]: v }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const b: Record<string, unknown> = {
        title: f.title,
        description: f.description,
        basePrice: parseInt(f.basePrice, 10) || 0,
        thumbnailUrl: f.thumbnailUrl || null,
        trailerVideoUrl: f.trailerVideoUrl || null,
        externalCheckoutUrl: f.externalCheckoutUrl || null,
        level: f.level,
        buttonText: f.buttonText || null,
        isPublished: f.isPublished,
        isFeaturedOnHome: f.isFeaturedOnHome,
        isComboOnly: f.isComboOnly,
      };
      if (f.slug) b.slug = f.slug;
      const r = await api.post<{ slug: string }>("/api/courses", b);
      router.push(`/quan-tri-vien/khoa-hoc/${r.slug}`);
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi tạo");
    } finally {
      setSaving(false);
    }
  };

  const slugPreviewUrl = f.slug ? `/khoa-hoc/${f.slug}` : null;

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h1 className={styles.panelTitle}>Tạo khóa học mới</h1>
          <div className={styles.panelBtns}>
            <button
              type="button"
              className={styles.cBtn}
              onClick={() => router.back()}
            >
              Hủy
            </button>
            <button
              type="submit"
              form="create-course-form"
              className={styles.sBtn}
              disabled={saving}
            >
              {saving ? "Đang tạo..." : "Tạo khóa học"}
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
          <form id="create-course-form" onSubmit={submit}>
            <div className={styles.mediaRow}>
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
              <div className={styles.fld}>
                <span className={styles.lbl}>Video trailer</span>
                <MediaTrigger
                  onSelect={(url) => onChange("trailerVideoUrl", url)}
                  value={f.trailerVideoUrl}
                  filter="video"
                  accept="video/*"
                >
                  {f.trailerVideoUrl ? "Đổi video" : "Chọn video trailer"}
                </MediaTrigger>
              </div>
            </div>

            <div>
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
                  minLength={10}
                />
              </div>
              {slugPreviewUrl && (
                <p className={styles.slugInfo}>URL: {slugPreviewUrl}</p>
              )}
              {!slugPreviewUrl && !f.title && (
                <p className={styles.slugInfo}>
                  Slug sẽ được tạo tự động khi nhập tiêu đề
                </p>
              )}
            </div>

            <div className={styles.fld}>
              <span className={styles.lbl}>
                Mô tả <span className={styles.req}>*</span>
              </span>
              <textarea
                className={styles.txa}
                value={f.description}
                onChange={(e) => onChange("description", e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className={styles.r}>
              <div className={styles.fld}>
                <span className={styles.lbl}>
                  Giá (VND) <span className={styles.req}>*</span>
                </span>
                <input
                  type="number"
                  className={styles.inp}
                  value={f.basePrice}
                  onChange={(e) => onChange("basePrice", e.target.value)}
                  required
                />
              </div>
              <div className={styles.fld}>
                <span className={styles.lbl}>Link thanh toán</span>
                <input
                  type="text"
                  className={styles.inp}
                  value={f.externalCheckoutUrl}
                  onChange={(e) =>
                    onChange("externalCheckoutUrl", e.target.value)
                  }
                  placeholder="https://go.minhtravel.vn/..."
                />
                <span className={styles.hint}>Redirect sang bên thứ 3</span>
              </div>
            </div>

            <div className={styles.r}>
              <div className={styles.fld}>
                <span className={styles.lbl}>Cấp độ</span>
                <select
                  className={styles.sel}
                  value={f.level}
                  onChange={(e) => onChange("level", e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="beginner">Cơ bản</option>
                  <option value="intermediate">Trung cấp</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </div>
              <div className={styles.fld}>
                <span className={styles.lbl}>Nhãn nút mua hàng</span>
                <input
                  type="text"
                  className={styles.inp}
                  value={f.buttonText}
                  onChange={(e) => onChange("buttonText", e.target.value)}
                  placeholder="Mua ngay"
                />
              </div>
            </div>

            <div className={styles.divider} />
            <span className={styles.sectionLbl}>Trạng thái</span>

            <div className={styles.toggles}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={f.isPublished}
                  onChange={(e) => onChange("isPublished", e.target.checked)}
                />
                <span>Xuất bản</span>
              </label>
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
                  checked={f.isComboOnly}
                  onChange={(e) => onChange("isComboOnly", e.target.checked)}
                />
                <span>Chỉ bán combo</span>
              </label>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.preview}>
        <div className={styles.previewHead}>
          <span className={styles.previewBadge}>Xem trước</span>
        </div>
        <div className={styles.previewPlaceholder}>
          <div className={styles.previewPlaceholderIcon}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.3"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p className={styles.previewPlaceholderText}>
            Lưu khóa học để xem preview
          </p>
          <p className={styles.previewPlaceholderHint}>
            Sau khi tạo, bạn sẽ được chuyển đến trang chỉnh sửa với đầy đủ chức
            năng xem trước
          </p>
        </div>
      </div>
    </div>
  );
}
