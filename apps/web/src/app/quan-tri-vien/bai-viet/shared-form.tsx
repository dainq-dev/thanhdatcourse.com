"use client";

import type { Block, Content } from "@workspace/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BlockEditor } from "@/components/admin/block-editor";
import { getDefaultData } from "@/components/admin/block-editor/editorState";
import { LeftPanel } from "@/components/admin/block-editor/LeftPanel";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ApiError, api } from "@/lib/api";
import styles from "./shared.module.scss";

interface Category {
  id: string;
  name: string;
  slug: string;
}

function slugify(text: string): string {
  return text
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

function extractText(blocks: Content): string {
  return blocks
    .map((b) => {
      const d = b.data as Record<string, unknown>;
      if (typeof d.text === "string") return d.text;
      if (typeof d.heading === "string") return d.heading;
      if (typeof d.code === "string") return d.code;
      if (Array.isArray(d.items))
        return d.items
          .filter((i: string) => typeof i === "string" && i.trim())
          .join(" ");
      if (Array.isArray(d.content))
        return d.content
          .map((c: unknown) => {
            if (typeof c === "string") return c;
            if (
              typeof c === "object" &&
              c &&
              "title" in (c as Record<string, unknown>)
            )
              return (c as Record<string, unknown>).title;
            return "";
          })
          .join(" ");
      return "";
    })
    .join(" ");
}

function calcReadTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 250));
}

export function SharedPostForm({
  mode,
  initialData,
  postId,
  onSave,
  onPublish,
  onDelete,
}: {
  mode: "create" | "edit";
  initialData?: {
    title: string;
    slug: string;
    excerpt: string;
    author: string;
    blocks: Content;
    thumbnailUrl?: string;
    seoDescription?: string;
    categoryId?: string;
    isPublished?: boolean;
  };
  postId?: string;
  onSave?: (data: Record<string, unknown>) => Promise<void>;
  onPublish?: (data: Record<string, unknown>) => Promise<void>;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "components">("info");
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnailUrl || "",
  );
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seoDescription || "",
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [author, setAuthor] = useState(initialData?.author || "minhtravel");
  const [blocks, setBlocks] = useState<Content>(initialData?.blocks || []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  const loadCategories = useCallback(() => {
    api
      .publicGet<{ data: Category[] } | Category[]>("/api/categories")
      .then((d) => setCategories(Array.isArray(d) ? d : (d.data ?? [])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (title) setSlug(slugify(title));
    else setSlug("");
  }, [title]);

  const readTime = calcReadTime(excerpt + " " + extractText(blocks));

  const addBlock = useCallback((type: Block["type"]) => {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, data: getDefaultData(type) } as Block,
    ]);
    setActiveTab("components");
  }, []);

  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    setAddingCat(true);
    try {
      const created = await api.post<Category>("/api/categories", { name });
      setCategories((prev) => [...prev, created]);
      setCategoryId(created.id);
      setNewCatName("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.detail ?? "Lỗi thêm danh mục")
          : "Lỗi thêm danh mục",
      );
    } finally {
      setAddingCat(false);
    }
  };

  const validate = (): boolean => {
    if (!title || title.length < 3) {
      setError("Tiêu đề phải có ít nhất 3 ký tự");
      return false;
    }
    if (!excerpt) {
      setError("Vui lòng nhập mô tả ngắn");
      return false;
    }
    setError("");
    return true;
  };

  const buildBody = (published: boolean) => ({
    title,
    slug,
    excerpt,
    author,
    readTime,
    isPublished: published,
    contentBlocks: JSON.stringify(blocks),
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(seoDescription ? { seoDescription } : {}),
    ...(categoryId ? { categoryId } : {}),
  });

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (onSave) await onSave(buildBody(false));
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (onPublish) await onPublish(buildBody(true));
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail ?? "Lỗi") : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    try {
      sessionStorage.setItem("preview-blocks", JSON.stringify(blocks));
    } catch {
      setError("Nội dung quá lớn, không thể xem trước.");
      return;
    }
    window.open("/xem-truoc", "_blank");
  };

  const infoPanel = (
    <div className={styles.infoPanel}>
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Slug</label>
        <input
          type="text"
          className={styles.infoInput}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="tu-dong-tu-tieu-de"
        />
        <span className={styles.infoHint}>Tự động từ tiêu đề</span>
      </div>
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Mô tả ngắn *</label>
        <textarea
          className={styles.infoTextarea}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          placeholder="Mô tả ngắn cho bài viết..."
        />
      </div>
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Thời gian đọc</label>
        <span className={styles.infoReadonly}>{readTime} phút (tự tính)</span>
      </div>
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Ảnh thumbnail</label>
        <MediaTrigger
          onSelect={setThumbnailUrl}
          value={thumbnailUrl}
          showPreview
        >
          {thumbnailUrl ? "Đổi ảnh" : "Chọn ảnh thumbnail"}
        </MediaTrigger>
        {thumbnailUrl && (
          <img src={thumbnailUrl} alt="" className={styles.thumbPreview} />
        )}
      </div>
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Danh mục</label>
        <select
          className={styles.infoInput}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className={styles.addCatRow}>
          <input
            type="text"
            className={styles.infoInputSm}
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Tên danh mục mới..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCategory();
            }}
          />
          <button
            type="button"
            className={styles.addCatBtn}
            onClick={handleAddCategory}
            disabled={addingCat || !newCatName.trim()}
          >
            {addingCat ? "..." : "+"}
          </button>
        </div>
      </div>
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Tác giả</label>
        <input
          type="text"
          className={styles.infoInput}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="minhtravel"
        />
      </div>
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>SEO Description</label>
        <textarea
          className={styles.infoTextarea}
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          rows={2}
          placeholder="SEO meta description..."
        />
      </div>
      {onDelete && (
        <button type="button" className={styles.deleteBtn} onClick={onDelete}>
          Xóa bài viết
        </button>
      )}
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => router.push("/quan-tri-vien/bai-viet")}
      >
        ← Quay lại danh sách
      </button>
    </div>
  );

  return (
    <>
      <div className={styles.wrapper}>
        {error && (
          <div className={styles.errorBar}>
            {error}
            <button type="button" onClick={() => setError("")}>
              ✕
            </button>
          </div>
        )}
        <div className={styles.editorArea}>
          <BlockEditor
            blocks={blocks}
            onChange={setBlocks}
            onSave={handleSave}
            onPublish={handlePublish}
            saving={saving}
            onPreview={handlePreview}
            titleInput={
              <div className={styles.titleArea}>
                <input
                  type="text"
                  className={styles.titleInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>
            }
            leftPanel={
              <LeftPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onDrop={addBlock}
                infoPanel={infoPanel}
              />
            }
          />
        </div>
      </div>
    </>
  );
}
