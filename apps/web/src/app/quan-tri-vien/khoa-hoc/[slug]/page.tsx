"use client";

import type { Content } from "@workspace/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BlockEditor } from "@/components/admin/block-editor";
import { ApiError, api } from "@/lib/api";
import styles from "./page.module.scss";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  originalPrice: number | null;
  level: string;
  buttonText: string | null;
  isPublished: number;
  isFeaturedOnHome: number;
  isComboOnly: number;
  contentBlocks: string | null;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "blocks">("info");
  const [courseId, setCourseId] = useState("");
  const [form, setForm] = useState({
    title: "",
    pathSlug: "",
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

  useEffect(() => {
    const load = async () => {
      try {
        const course = await api.get<Course>(`/api/courses/${slug}`);
        setCourseId(course.id);
        setForm({
          title: course.title,
          pathSlug: course.slug,
          description: course.description,
          basePrice: String(course.basePrice),
          originalPrice: course.originalPrice
            ? String(course.originalPrice)
            : "",
          level: course.level || "all",
          isPublished: course.isPublished === 1,
          isFeaturedOnHome: course.isFeaturedOnHome === 1,
          isComboOnly: course.isComboOnly === 1,
          buttonText: course.buttonText || "",
        });
        if (course.contentBlocks) {
          try {
            const parsed = JSON.parse(course.contentBlocks);
            if (Array.isArray(parsed)) setBlocks(parsed);
          } catch {
            /* ignore */
          }
        }
      } catch {
        setError("Không thể tải khóa học");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlocksChange = useCallback((newBlocks: Content) => {
    setBlocks(newBlocks);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/api/courses/${courseId}`, {
        title: form.title,
        slug: form.pathSlug || undefined,
        description: form.description,
        basePrice: parseInt(form.basePrice, 10) || 0,
        originalPrice: form.originalPrice
          ? parseInt(form.originalPrice, 10)
          : null,
        level: form.level,
        isPublished: form.isPublished,
        isFeaturedOnHome: form.isFeaturedOnHome,
        isComboOnly: form.isComboOnly,
        buttonText: form.buttonText || null,
        contentBlocks: JSON.stringify(blocks),
      });
      router.push("/quan-tri-vien/khoa-hoc");
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Chỉnh sửa khóa học</h1>
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

      <form onSubmit={handleSave} className={styles.form}>
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
                required
                minLength={10}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Slug</label>
              <input
                type="text"
                className={styles.input}
                value={form.pathSlug}
                onChange={(e) => handleChange("pathSlug", e.target.value)}
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
              <label className={styles.label}>Text nút CTA</label>
              <input
                type="text"
                className={styles.input}
                value={form.buttonText}
                onChange={(e) => handleChange("buttonText", e.target.value)}
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
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
