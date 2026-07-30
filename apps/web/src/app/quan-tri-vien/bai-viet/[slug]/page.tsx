"use client";

import type { Block, Content } from "@workspace/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BlockEditor } from "@/components/admin/block-editor";
import { LeftPanel } from "@/components/admin/block-editor/LeftPanel";
import { getDefaultData } from "@/components/admin/block-editor/editorState";
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
  const [activeTab, setActiveTab] = useState<"info" | "components">("info");
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

  const addBlock = useCallback((type: Block["type"]) => {
    setBlocks((prev) => [...prev, { id: crypto.randomUUID(), type, data: getDefaultData(type) } as Block]);
    setActiveTab("components");
  }, []);

  const handleSave = useCallback(async () => {
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
  }, [form, blocks, postId, router]);

  const handlePublish = useCallback(async () => {
    setForm((prev) => ({ ...prev, isPublished: true }));
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
        isPublished: true,
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
  }, [form, blocks, postId, router]);

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
      {error && <div className={styles.error}>{error}<button type="button" onClick={() => setError("")}>✕</button></div>}
      <BlockEditor
        blocks={blocks}
        onChange={setBlocks}
        onSave={handleSave}
        onPublish={handlePublish}
        saving={saving}
        titleInput={
          <div style={{ marginBottom: "16px" }}>
            <div className={styles.metaInline}>
              <input type="text" className={styles.titleInput} value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Tiêu đề bài viết..." />
              <div className={styles.metaRow}>
                <input type="text" className={styles.slugInput} value={form.pathSlug}
                  onChange={(e) => handleChange("pathSlug", e.target.value)} placeholder="slug" />
                <input type="text" className={styles.slugInput} value={form.author}
                  onChange={(e) => handleChange("author", e.target.value)} placeholder="Tác giả" />
                <input type="number" className={styles.slugInput} value={form.readTime}
                  onChange={(e) => handleChange("readTime", e.target.value)} placeholder="Phút đọc" />
              </div>
            </div>
          </div>
        }
        leftPanel={
          <LeftPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onDrop={addBlock}
            infoPanel={
              <div>
                <div className={styles.infoField}>
                  <label className={styles.infoLabel}>Mô tả ngắn *</label>
                  <textarea className={styles.infoTextarea} value={form.excerpt}
                    onChange={(e) => handleChange("excerpt", e.target.value)} rows={3}
                    placeholder="Mô tả ngắn cho bài viết..." />
                </div>
                <div className={styles.infoField}>
                  <label className={styles.infoLabel}>Trạng thái</label>
                  <label className={styles.infoToggle}>
                    <input type="checkbox" checked={form.isPublished}
                      onChange={(e) => handleChange("isPublished", e.target.checked)} />
                    <span>Xuất bản</span>
                  </label>
                </div>
                <button type="button" className={styles.deleteBtn}
                  onClick={handleDelete}>
                  Xóa bài viết
                </button>
                <button type="button" className={styles.backBtn}
                  onClick={() => router.push("/quan-tri-vien/bai-viet")}>
                  ← Quay lại danh sách
                </button>
              </div>
            }
          />
        }
      />
    </div>
  );
}
