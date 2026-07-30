"use client";

import type { Content } from "@workspace/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BlockEditor } from "@/components/admin/block-editor";
import { ApiError, api } from "@/lib/api";
import styles from "./page.module.scss";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentBlocks: string | null;
  author: string;
  readTime: number;
  isPublished: number;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [postId, setPostId] = useState("");
  const [form, setForm] = useState({
    title: "",
    pathSlug: "",
    excerpt: "",
    author: "minhtravel",
    readTime: "5",
    isPublished: false,
  });
  const [blocks, setBlocks] = useState<Content>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const post = await api.get<Post>(`/api/posts/${slug}`);
        setPostId(post.id);
        setForm({
          title: post.title,
          pathSlug: post.slug,
          excerpt: post.excerpt,
          author: post.author || "minhtravel",
          readTime: String(post.readTime || 5),
          isPublished: post.isPublished === 1,
        });
        if (post.contentBlocks) {
          try {
            const parsed = JSON.parse(post.contentBlocks);
            if (Array.isArray(parsed)) setBlocks(parsed);
          } catch {
            /* ignore */
          }
        }
      } catch {
        setError("Không thể tải bài viết");
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
    if (!form.title || form.title.length < 3) {
      setError("Tiêu đề phải có ít nhất 3 ký tự");
      return;
    }
    if (!form.excerpt) {
      setError("Vui lòng nhập mô tả ngắn");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/api/posts/${postId}`, {
        title: form.title,
        slug: form.pathSlug || undefined,
        excerpt: form.excerpt,
        author: form.author,
        readTime: parseInt(form.readTime, 10) || 5,
        isPublished: form.isPublished,
        contentBlocks: JSON.stringify(blocks),
      });
      router.push("/quan-tri-vien/bai-viet");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.detail ?? "Không thể lưu bài viết")
          : "Không thể kết nối đến máy chủ",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await api.del(`/api/posts/${postId}`);
      router.push("/quan-tri-vien/bai-viet");
    } catch {
      setError("Không thể xóa bài viết");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Chỉnh sửa bài viết</h1>
      <form onSubmit={handleSave} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.metaForm}>
          <div className={styles.field}>
            <label className={styles.label}>Tiêu đề *</label>
            <input
              type="text"
              className={styles.input}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Tiêu đề bài viết"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Slug</label>
            <input
              type="text"
              className={styles.input}
              value={form.pathSlug}
              onChange={(e) => handleChange("pathSlug", e.target.value)}
              placeholder="Đường dẫn URL"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Mô tả ngắn *</label>
            <textarea
              className={styles.textarea}
              value={form.excerpt}
              onChange={(e) => handleChange("excerpt", e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Tác giả</label>
              <input
                type="text"
                className={styles.input}
                value={form.author}
                onChange={(e) => handleChange("author", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Thời gian đọc (phút)</label>
              <input
                type="number"
                className={styles.input}
                value={form.readTime}
                onChange={(e) => handleChange("readTime", e.target.value)}
              />
            </div>
          </div>
          <div className={styles.toggles}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => handleChange("isPublished", e.target.checked)}
              />
              <span>Xuất bản</span>
            </label>
          </div>
        </div>

        <div className={styles.editorSection}>
          <h2 className={styles.editorTitle}>Nội dung bài viết</h2>
          <BlockEditor blocks={blocks} onChange={handleBlocksChange} />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.deleteActionBtn}
            onClick={handleDelete}
          >
            Xóa bài viết
          </button>
          <div className={styles.actionsRight}>
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
        </div>
      </form>
    </div>
  );
}
