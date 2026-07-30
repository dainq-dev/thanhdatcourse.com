"use client";

import type { Content } from "@workspace/types";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { BlockEditor } from "@/components/admin/block-editor";
import { ApiError, api } from "@/lib/api";
import styles from "./page.module.scss";

export default function CreateCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "blocks">("info");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    basePrice: "",
    originalPrice: "",
    level: "all",
    isPublished: false,
    isFeaturedOnHome: false,
    isComboOnly: false,
    buttonText: "",
  });
  const [blocks, setBlocks] = useState<Content>([]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlocksChange = useCallback((newBlocks: Content) => {
    setBlocks(newBlocks);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      basePrice: parseInt(form.basePrice, 10) || 0,
      isPublished: form.isPublished,
      isFeaturedOnHome: form.isFeaturedOnHome,
      isComboOnly: form.isComboOnly,
      contentBlocks: JSON.stringify(blocks),
    };

    if (form.slug) body.slug = form.slug;
    if (form.originalPrice)
      body.originalPrice = parseInt(form.originalPrice, 10);
    if (form.level) body.level = form.level;
    if (form.buttonText) body.buttonText = form.buttonText;

    try {
      const course = await api.post<{ slug: string }>("/api/courses", body);
      router.push(`/quan-tri-vien/khoa-hoc/${course.slug}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.detail ?? "Lỗi khi tạo khóa học")
          : "Lỗi khi tạo khóa học",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Tạo khóa học mới</h1>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "info" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Thông tin
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "blocks" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("blocks")}
        >
          Giới thiệu (Blocks)
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        {activeTab === "info" && (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label className={styles.label}>Tiêu đề *</label>
              <input
                type="text"
                className={styles.input}
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Tối thiểu 10 ký tự"
                required
                minLength={10}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Slug</label>
              <input
                type="text"
                className={styles.input}
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="Tự động từ tiêu đề nếu để trống"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Mô tả *</label>
              <textarea
                className={styles.textarea}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Giá (VND) *</label>
                <input
                  type="number"
                  className={styles.input}
                  value={form.basePrice}
                  onChange={(e) => handleChange("basePrice", e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Giá gốc (VND)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={form.originalPrice}
                  onChange={(e) =>
                    handleChange("originalPrice", e.target.value)
                  }
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Cấp độ</label>
              <select
                className={styles.input}
                value={form.level}
                onChange={(e) => handleChange("level", e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Text nút CTA (tùy chọn)</label>
              <input
                type="text"
                className={styles.input}
                value={form.buttonText}
                onChange={(e) => handleChange("buttonText", e.target.value)}
                placeholder="Mặc định: Mua ngay"
              />
            </div>
            <div className={styles.toggles}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) =>
                    handleChange("isPublished", e.target.checked)
                  }
                />
                <span>Xuất bản</span>
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.isFeaturedOnHome}
                  onChange={(e) =>
                    handleChange("isFeaturedOnHome", e.target.checked)
                  }
                />
                <span>Nổi bật trên trang chủ</span>
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.isComboOnly}
                  onChange={(e) =>
                    handleChange("isComboOnly", e.target.checked)
                  }
                />
                <span>Chỉ bán trong combo</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === "blocks" && (
          <div className={styles.tabContent}>
            <BlockEditor blocks={blocks} onChange={handleBlocksChange} />
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.back()}
          >
            Hủy
          </button>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Đang lưu..." : "Tạo khóa học"}
          </button>
        </div>
      </form>
    </div>
  );
}
