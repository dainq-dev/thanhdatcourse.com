"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaFile, MediaFilter } from "./types";
import { fetchMediaList, getMediaUrl, uploadFile, deleteMedia } from "./index.logic";
import styles from "./index.module.scss";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  filter?: MediaFilter;
  accept?: string;
  value?: string;
}

export function MediaManager({ open, onClose, onSelect, filter: defaultFilter = "all", accept, value }: Props) {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [filter, setFilter] = useState<MediaFilter>(defaultFilter);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMediaList(filter, page, search, limit);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch {
      setError("Không thể tải danh sách media");
    } finally {
      setLoading(false);
    }
  }, [filter, page, search]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(), 300);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const f of Array.from(files)) {
        await uploadFile(f);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa file này không?")) return;
    try {
      await deleteMedia(id);
      await load();
    } catch {
      setError("Không thể xóa file");
    }
  };

  const handlePick = (file: MediaFile) => {
    setSelectedId(file.id);
    onSelect(getMediaUrl(file));
    onClose();
  };

  const totalPages = Math.ceil(total / limit);
  const activeFilter = accept
    ? accept.startsWith("image") ? "image" : accept.startsWith("video") ? "video" : "all"
    : filter;

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Thư viện ảnh & video</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">✕</button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {(["all", "image", "video", "youtube"] as MediaFilter[]).map((t) => (
              <button
                key={t}
                className={activeFilter === t ? styles.filterActive : styles.filterBtn}
                onClick={() => { setFilter(t); setPage(1); }}
                type="button"
              >
                {t === "all" ? "Tất cả" : t === "image" ? "Ảnh" : t === "video" ? "Video" : "YouTube"}
              </button>
            ))}
          </div>
          <div className={styles.toolbarRight}>
            <input
              className={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <label className={styles.uploadBtn}>
              {uploading ? "Đang tải..." : "Tải lên"}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={accept || "image/*,video/*"}
                className={styles.fileInput}
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {error && <div className={styles.errorBar}>{error}</div>}

        {/* Grid */}
        {loading ? (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.gridSkeleton} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Chưa có file nào</p>
            <p className={styles.emptyHint}>Tải lên ảnh hoặc video để bắt đầu</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {items.map((file) => {
                const url = getMediaUrl(file);
                const isImage = file.mimeType?.startsWith("image/");
                const isSelected = selectedId === file.id || value === url;

                return (
                  <button
                    key={file.id}
                    className={`${styles.gridItem} ${isSelected ? styles.gridItemSelected : ""}`}
                    onClick={() => setPreviewFile(file)}
                    onDoubleClick={() => handlePick(file)}
                    type="button"
                  >
                    {isImage || file.source === "youtube" ? (
                      <img src={url} alt={file.originalName} className={styles.thumb} loading="lazy" />
                    ) : file.mimeType?.startsWith("video/") ? (
                      <div className={styles.videoThumb}>
                        <span className={styles.videoIcon}>▶</span>
                      </div>
                    ) : (
                      <div className={styles.docThumb}>
                        <span className={styles.docIcon}>📄</span>
                      </div>
                    )}
                    <div className={styles.itemMeta}>
                      <span className={styles.itemName}>{file.originalName}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  type="button"
                >
                  ← Trước
                </button>
                <span className={styles.pageInfo}>
                  {page} / {totalPages}
                </span>
                <button
                  className={styles.pageBtn}
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  type="button"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}

        {/* Preview panel (bottom bar when file selected) */}
        {previewFile && (
          <div className={styles.previewBar}>
            <div className={styles.previewBarInfo}>
              <strong>{previewFile.originalName}</strong>
              <span>{(previewFile.fileSize / 1024).toFixed(1)} KB</span>
              {previewFile.width && previewFile.height && (
                <span>{previewFile.width}×{previewFile.height}</span>
              )}
            </div>
            <div className={styles.previewBarActions}>
              <button className={styles.actionBtn} onClick={() => handlePick(previewFile)} type="button">
                ✓ Chọn file này
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(previewFile.id)} type="button">
                ✕ Xóa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
