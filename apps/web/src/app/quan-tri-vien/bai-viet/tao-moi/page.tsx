"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import type { Block, Content } from "@workspace/types";
import { ApiError, api } from "@/lib/api";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { BlockEditor } from "@/components/admin/block-editor";
import { LeftPanel } from "@/components/admin/block-editor/LeftPanel";
import styles from "./page.module.scss";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "components">("info");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [author, setAuthor] = useState("minhtravel");
  const [readTime, setReadTime] = useState("5");
  const [blocks, setBlocks] = useState<Content>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.publicGet<{ data: Category[] } | Category[]>("/api/categories")
      .then((d) => setCategories(Array.isArray(d) ? d : d.data ?? []))
      .catch(() => {});
  }, []);

  const addBlock = useCallback((type: Block["type"]) => {
    setBlocks((prev) => [...prev, { id: crypto.randomUUID(), type, data: {} } as Block]);
    setActiveTab("components");
  }, []);

  const validate = (): boolean => {
    if (!title || title.length < 3) { setError("Tiêu đề phải có ít nhất 3 ký tự"); return false; }
    if (!excerpt) { setError("Vui lòng nhập mô tả ngắn"); return false; }
    setError("");
    return true;
  };

  const doSave = async (published: boolean) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title, excerpt, author, readTime: parseInt(readTime, 10) || 5,
        isPublished: published,
        contentBlocks: JSON.stringify(blocks),
      };
      if (slug) body.slug = slug;
      if (thumbnailUrl) body.thumbnailUrl = thumbnailUrl;
      if (seoDescription) body.seoDescription = seoDescription;
      if (categoryId) body.categoryId = categoryId;
      await api.post<{ slug: string }>("/api/posts", body);
      router.push("/quan-tri-vien/bai-viet");
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.errorBar}>{error}<button type="button" onClick={() => setError("")}>✕</button></div>
      )}
      <div className={styles.editorArea}>
        <BlockEditor
          blocks={blocks}
          onChange={setBlocks}
          onSave={() => doSave(false)}
          onPublish={() => doSave(true)}
          saving={saving}
          titleInput={
            <div className={styles.titleArea}>
              <input type="text" className={styles.titleInput} value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết..." />
            </div>
          }
          leftPanel={
            <LeftPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onDrop={addBlock}
              infoPanel={
                <div className={styles.infoPanel}>
                  <div className={styles.infoField}>
                    <label className={styles.infoLabel}>Slug</label>
                    <input type="text" className={styles.infoInput} value={slug}
                      onChange={(e) => setSlug(e.target.value)} placeholder="tu-dong-tu-tieu-de" />
                  </div>
                  <div className={styles.infoField}>
                    <label className={styles.infoLabel}>Mô tả ngắn *</label>
                    <textarea className={styles.infoTextarea} value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)} rows={3}
                      placeholder="Mô tả ngắn cho bài viết..." />
                  </div>
                  <div className={styles.infoField}>
                    <label className={styles.infoLabel}>Ảnh thumbnail</label>
                    <MediaTrigger onSelect={setThumbnailUrl} value={thumbnailUrl} showPreview>
                      {thumbnailUrl ? "Đổi ảnh" : "Chọn ảnh thumbnail"}
                    </MediaTrigger>
                    {thumbnailUrl && <img src={thumbnailUrl} alt="" className={styles.thumbPreview} />}
                  </div>
                  <div className={styles.infoField}>
                    <label className={styles.infoLabel}>Danh mục</label>
                    <select className={styles.infoInput} value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.infoField}>
                    <label className={styles.infoLabel}>Tác giả</label>
                    <input type="text" className={styles.infoInput} value={author}
                      onChange={(e) => setAuthor(e.target.value)} placeholder="minhtravel" />
                  </div>
                  <div className={styles.infoField}>
                    <label className={styles.infoLabel}>Thời gian đọc (phút)</label>
                    <input type="number" className={styles.infoInput} value={readTime}
                      onChange={(e) => setReadTime(e.target.value)} />
                  </div>
                  <div className={styles.infoField}>
                    <label className={styles.infoLabel}>SEO Description</label>
                    <textarea className={styles.infoTextarea} value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)} rows={2}
                      placeholder="SEO meta description..." />
                  </div>
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
    </div>
  );
}
