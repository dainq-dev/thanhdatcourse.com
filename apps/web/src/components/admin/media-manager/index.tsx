"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import embedStyles from "./embed.module.scss";
import {
  addYoutubeVideo,
  deleteMedia,
  deleteMediaBulk,
  fetchMediaList,
  fetchMediaListSorted,
  getMediaUrl,
  getMediaVariantUrls,
  updateAltText,
  uploadFile,
  uploadFileWithProgress,
} from "./index.logic";
import styles from "./index.module.scss";
import type { MediaFile, MediaFilter } from "./types";

// ── Shared props ──

interface SharedProps {
  filter?: MediaFilter;
  accept?: string;
  value?: string;
  multi?: boolean;
  onSelect?: (url: string) => void;
  sortable?: boolean;
  enableDetail?: boolean;
  enableBulkDelete?: boolean;
  enableYoutube?: boolean;
  enableDragDrop?: boolean;
  enableClipboard?: boolean;
}

// ── Modal props ──

interface ModalProps extends SharedProps {
  open: boolean;
  onClose: () => void;
  mode?: "modal";
}

// ── Inline props ──

interface InlineProps extends SharedProps {
  mode: "inline";
  open?: never;
  onClose?: never;
}

type Props = ModalProps | InlineProps;

// ── Internal grid+toolbar renderer ──

function MediaManagerContent({
  filter: defaultFilter = "all",
  accept,
  value,
  multi,
  onSelect,
  sortable: enableSort = true,
  enableDetail = true,
  enableBulkDelete = true,
  enableYoutube = true,
  enableDragDrop = true,
  enableClipboard = true,
  mode = "modal",
  onClose,
  onCloseDetail,
}: SharedProps & {
  mode: "modal" | "inline";
  onClose: (() => void) | undefined;
  onCloseDetail: (() => void) | undefined;
}) {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [filter, setFilter] = useState<MediaFilter>(defaultFilter);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [sort, setSort] = useState("newest");
  const [altText, setAltText] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{
    name: string;
    pct: number;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [addingYoutube, setAddingYoutube] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = enableSort
        ? await fetchMediaListSorted(filter, page, search, sort, limit)
        : await fetchMediaList(filter, page, search, limit);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch {
      setError("Không thể tải danh sách media");
    } finally {
      setLoading(false);
    }
  }, [filter, page, search, sort, enableSort]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(), 300);
  };

  const handleUpload = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploading(true);
    setError("");
    for (const f of arr) {
      try {
        setUploadProgress({ name: f.name, pct: 0 });
        await uploadFileWithProgress(f, (pct) => {
          setUploadProgress((prev) =>
            prev?.name === f.name ? { name: f.name, pct } : prev,
          );
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload thất bại");
      }
    }
    setUploadProgress(null);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    await load();
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleUpload(files);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id);
      setPreviewFile(null);
      await load();
    } catch {
      setError("Không thể xóa file");
    }
  };

  const handleBulkDelete = async () => {
    if (bulkSelected.size === 0) return;
    try {
      await deleteMediaBulk(Array.from(bulkSelected));
      setBulkSelected(new Set());
      await load();
    } catch {
      setError("Không thể xóa file");
    }
  };

  const handlePick = (file: MediaFile) => {
    if (multi) {
      setBulkSelected((prev) => {
        const next = new Set(prev);
        if (next.has(file.id)) next.delete(file.id);
        else next.add(file.id);
        return next;
      });
      return;
    }
    setSelectedId(file.id);
    if (onSelect) {
      onSelect(getMediaUrl(file));
    }
    if (mode === "modal" && onClose) onClose();
  };

  const handleMultiConfirm = () => {
    if (bulkSelected.size === 0) return;
    const urls = items
      .filter((f) => bulkSelected.has(f.id))
      .map((f) => getMediaUrl(f));
    if (onSelect) onSelect(urls.join("\n"));
    if (mode === "modal" && onClose) onClose();
  };

  const toggleBulkSelect = (id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openDetail = (file: MediaFile) => {
    setPreviewFile(file);
    setAltText(file.altText || "");
  };

  const handleAltSave = async () => {
    if (!previewFile) return;
    try {
      await updateAltText(previewFile.id, altText);
      setPreviewFile((prev) => (prev ? { ...prev, altText } : prev));
    } catch {
      setError("Không thể cập nhật alt text");
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) return;
    setAddingYoutube(true);
    setError("");
    try {
      await addYoutubeVideo(youtubeUrl.trim());
      setYoutubeUrl("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thêm YouTube thất bại");
    } finally {
      setAddingYoutube(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback
    }
  };

  // ── Drag & drop ──
  useEffect(() => {
    if (!enableDragDrop) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      setDragOver(true);
    };
    const onDragLeave = (e: DragEvent) => {
      if (e.target === document.documentElement) setDragOver(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer?.files.length) handleUpload(e.dataTransfer.files);
    };

    document.addEventListener("dragover", onDragOver);
    document.addEventListener("dragleave", onDragLeave);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("dragleave", onDragLeave);
      document.removeEventListener("drop", onDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableDragDrop]);

  // ── Clipboard paste ──
  useEffect(() => {
    if (!enableClipboard) return;

    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        handleUpload(files);
      }
    };

    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableClipboard]);

  const totalPages = Math.ceil(total / limit);
  const activeFilter = accept
    ? accept.startsWith("image")
      ? "image"
      : accept.startsWith("video")
        ? "video"
        : "all"
    : filter;

  const variantUrls = previewFile ? getMediaVariantUrls(previewFile) : [];

  return (
    <>
      {/* Drag overlay */}
      {dragOver && (
        <div className={embedStyles.dropZone}>
          <span className={embedStyles.dropZoneText}>
            Thả file vào đây để upload
          </span>
          <span className={embedStyles.dropZoneHint}>
            Hỗ trợ ảnh, video, tài liệu
          </span>
        </div>
      )}

      {/* Upload progress overlay */}
      {uploadProgress && (
        <div className={embedStyles.uploadOverlay}>
          <div className={embedStyles.uploadOverlayTitle}>Đang tải lên</div>
          <div className={embedStyles.uploadItem}>
            <span className={embedStyles.uploadItemName}>
              {uploadProgress.name}
            </span>
            <span className={embedStyles.uploadItemPct}>
              {uploadProgress.pct}%
            </span>
          </div>
          <div className={embedStyles.uploadProgressBar}>
            <div
              className={embedStyles.uploadProgressFill}
              style={{ width: `${uploadProgress.pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Page title (inline mode only) */}
      {mode === "inline" && (
        <div className={embedStyles.header}>
          <h1 className={embedStyles.pageTitle}>Thư viện ảnh &amp; video</h1>
          <div className={embedStyles.headerRight}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept || "image/*,video/*"}
              className={embedStyles.fileInput}
              onChange={handleFileInput}
              disabled={uploading}
            />
            <button
              className={embedStyles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              type="button"
            >
              {uploading ? "Đang tải..." : "+ Tải lên"}
            </button>
          </div>
        </div>
      )}

      {/* YouTube form */}
      {enableYoutube && mode === "inline" && (
        <div className={embedStyles.youtubeForm}>
          <span className={embedStyles.youtubeLabel}>YouTube:</span>
          <input
            className={embedStyles.youtubeInput}
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleYoutubeSubmit()}
          />
          <button
            className={embedStyles.youtubeBtn}
            onClick={handleYoutubeSubmit}
            disabled={addingYoutube || !youtubeUrl.trim()}
            type="button"
          >
            {addingYoutube ? "Đang thêm..." : "Thêm"}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className={mode === "inline" ? embedStyles.toolbar : styles.toolbar}>
        {(mode === "inline" ? embedStyles : styles) && (
          <div
            className={
              mode === "inline"
                ? embedStyles.toolbarLeft
                : (styles as Record<string, string>).filters || ""
            }
          >
            <div className={mode === "inline" ? embedStyles.filters : ""}>
              {(["all", "image", "video", "youtube"] as MediaFilter[]).map(
                (t) => (
                  <button
                    key={t}
                    className={
                      activeFilter === t
                        ? mode === "inline"
                          ? embedStyles.filterActive
                          : styles.filterActive
                        : mode === "inline"
                          ? embedStyles.filterBtn
                          : styles.filterBtn
                    }
                    onClick={() => {
                      setFilter(t);
                      setPage(1);
                    }}
                    type="button"
                  >
                    {t === "all"
                      ? "Tất cả"
                      : t === "image"
                        ? "Ảnh"
                        : t === "video"
                          ? "Video"
                          : "YouTube"}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        <div
          className={
            mode === "inline" ? embedStyles.toolbarRight : styles.toolbarRight
          }
        >
          {enableSort && (
            <select
              className={embedStyles.sortSelect}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="size_desc">Dung lượng</option>
            </select>
          )}
          <input
            className={
              mode === "inline" ? embedStyles.searchInput : styles.searchInput
            }
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {mode === "modal" && (
            <label className={styles.uploadBtn}>
              {uploading ? "Đang tải..." : "Tải lên"}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={accept || "image/*,video/*"}
                className={styles.fileInput}
                onChange={handleFileInput}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {error && (
        <div
          className={mode === "inline" ? embedStyles.errorBar : styles.errorBar}
        >
          {error}
          <button
            className={embedStyles.errorClose}
            onClick={() => setError("")}
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal: multi-select bar */}
      {mode === "modal" && multi && bulkSelected.size > 0 && (
        <div className={styles.previewBar}>
          <div className={styles.previewBarInfo}>
            <strong>Đã chọn {bulkSelected.size} file</strong>
          </div>
          <div className={styles.previewBarActions}>
            <button
              className={styles.actionBtn}
              onClick={handleMultiConfirm}
              type="button"
            >
              ✓ Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* Inline: bulk delete bar */}
      {mode === "inline" && enableBulkDelete && bulkSelected.size > 0 && (
        <div className={embedStyles.bulkBar}>
          <div className={embedStyles.bulkBarInfo}>
            Đã chọn {bulkSelected.size} file
          </div>
          <div className={embedStyles.bulkBarActions}>
            <button
              className={embedStyles.bulkDeleteBtn}
              onClick={handleBulkDelete}
              type="button"
            >
              🗑 Xóa đã chọn
            </button>
            <button
              className={embedStyles.bulkCancelBtn}
              onClick={() => setBulkSelected(new Set())}
              type="button"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div
          className={
            mode === "inline" ? embedStyles.loadingGrid : styles.loadingGrid
          }
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={
                mode === "inline"
                  ? embedStyles.gridSkeleton
                  : styles.gridSkeleton
              }
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          className={
            mode === "inline" ? embedStyles.emptyState : styles.emptyState
          }
        >
          {mode === "inline" ? (
            <>
              <div className={embedStyles.emptyIcon}>📁</div>
              <p>Chưa có file nào</p>
              <p className={embedStyles.emptyHint}>
                Kéo thả file vào đây hoặc nhấn &quot;Tải lên&quot; để bắt đầu
              </p>
            </>
          ) : (
            <>
              <p>Chưa có file nào</p>
              <p className={styles.emptyHint}>
                Tải lên ảnh hoặc video để bắt đầu
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className={mode === "inline" ? embedStyles.grid : styles.grid}>
            {items.map((file) => {
              const url = getMediaUrl(file);
              const isImage = file.mimeType?.startsWith("image/");
              const isVideo = file.mimeType?.startsWith("video/");
              const isYoutube = file.source === "youtube";
              const isSelected = multi
                ? bulkSelected.has(file.id)
                : selectedId === file.id || value === url;

              return (
                <div
                  key={file.id}
                  className={`${mode === "inline" ? embedStyles.gridItem : styles.gridItem} ${
                    isSelected
                      ? mode === "inline"
                        ? embedStyles.gridItemSelected
                        : styles.gridItemSelected
                      : ""
                  }`}
                  onClick={() => {
                    if (multi) {
                      handlePick(file);
                    } else if (enableDetail && mode === "inline") {
                      openDetail(file);
                    } else {
                      setPreviewFile(file);
                    }
                  }}
                  onDoubleClick={() => !multi && handlePick(file)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (multi) handlePick(file);
                      else if (enableDetail && mode === "inline")
                        openDetail(file);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {(enableBulkDelete && mode === "inline") ||
                  (multi && mode === "modal") ? (
                    <input
                      type="checkbox"
                      className={embedStyles.gridCheckbox}
                      checked={bulkSelected.has(file.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleBulkSelect(file.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : null}

                  {isImage || isYoutube ? (
                    <img
                      src={url}
                      alt={file.originalName}
                      className={
                        mode === "inline" ? embedStyles.thumb : styles.thumb
                      }
                      loading="lazy"
                    />
                  ) : isVideo ? (
                    <div
                      className={
                        mode === "inline"
                          ? embedStyles.videoThumb
                          : styles.videoThumb
                      }
                    >
                      <span
                        className={
                          mode === "inline"
                            ? embedStyles.videoIcon
                            : styles.videoIcon
                        }
                      >
                        ▶
                      </span>
                    </div>
                  ) : (
                    <div
                      className={
                        mode === "inline"
                          ? embedStyles.docThumb
                          : styles.docThumb
                      }
                    >
                      <span
                        className={
                          mode === "inline"
                            ? embedStyles.docIcon
                            : styles.docIcon
                        }
                      >
                        📄
                      </span>
                    </div>
                  )}

                  <span className={embedStyles.typeBadge}>
                    {isYoutube
                      ? "YT"
                      : isVideo
                        ? "VID"
                        : isImage
                          ? "IMG"
                          : "FILE"}
                  </span>

                  <div
                    className={
                      mode === "inline" ? embedStyles.itemMeta : styles.itemMeta
                    }
                  >
                    <span
                      className={
                        mode === "inline"
                          ? embedStyles.itemName
                          : styles.itemName
                      }
                    >
                      {file.originalName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className={
                mode === "inline" ? embedStyles.pagination : styles.pagination
              }
            >
              <button
                className={
                  mode === "inline" ? embedStyles.pageBtn : styles.pageBtn
                }
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                ← Trước
              </button>
              <span
                className={
                  mode === "inline" ? embedStyles.pageInfo : styles.pageInfo
                }
              >
                {page} / {totalPages}
              </span>
              <button
                className={
                  mode === "inline" ? embedStyles.pageBtn : styles.pageBtn
                }
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

      {/* Modal: preview bar */}
      {mode === "modal" && previewFile && (
        <div className={styles.previewBar}>
          <div className={styles.previewBarInfo}>
            <strong>{previewFile.originalName}</strong>
            <span>{(previewFile.fileSize / 1024).toFixed(1)} KB</span>
            {previewFile.width && previewFile.height && (
              <span>
                {previewFile.width}×{previewFile.height}
              </span>
            )}
          </div>
          <div className={styles.previewBarActions}>
            <button
              className={styles.actionBtn}
              onClick={() => handlePick(previewFile)}
              type="button"
            >
              ✓ Chọn file này
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDelete(previewFile.id)}
              type="button"
            >
              ✕ Xóa
            </button>
          </div>
        </div>
      )}

      {/* Inline: detail panel */}
      {mode === "inline" && previewFile && (
        <div
          className={embedStyles.detailOverlay}
          onClick={() => setPreviewFile(null)}
        >
          <div
            className={embedStyles.detailPanel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={embedStyles.detailHeader}>
              <h3 className={embedStyles.detailTitle}>
                {previewFile.originalName}
              </h3>
              <button
                className={embedStyles.detailCloseBtn}
                onClick={() => setPreviewFile(null)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className={embedStyles.detailBody}>
              {/* Preview */}
              {previewFile.mimeType?.startsWith("image/") ||
              previewFile.source === "youtube" ? (
                <img
                  src={getMediaUrl(previewFile)}
                  alt={previewFile.originalName}
                  className={embedStyles.detailPreview}
                />
              ) : previewFile.mimeType?.startsWith("video/") ? (
                <div className={embedStyles.detailVideoPreview}>
                  <span>▶</span>
                </div>
              ) : (
                <div className={embedStyles.detailVideoPreview}>
                  <span>📄</span>
                </div>
              )}

              {/* Meta */}
              <div className={embedStyles.detailMeta}>
                <div className={embedStyles.detailField}>
                  <span className={embedStyles.detailLabel}>Tên file</span>
                  <span className={embedStyles.detailValue}>
                    {previewFile.originalName}
                  </span>
                </div>
                <div className={embedStyles.detailField}>
                  <span className={embedStyles.detailLabel}>Dung lượng</span>
                  <span className={embedStyles.detailValue}>
                    {(previewFile.fileSize / 1024).toFixed(1)} KB
                  </span>
                </div>
                {previewFile.width && previewFile.height && (
                  <div className={embedStyles.detailField}>
                    <span className={embedStyles.detailLabel}>Kích thước</span>
                    <span className={embedStyles.detailValue}>
                      {previewFile.width} × {previewFile.height} px
                    </span>
                  </div>
                )}
                <div className={embedStyles.detailField}>
                  <span className={embedStyles.detailLabel}>Loại</span>
                  <span className={embedStyles.detailValue}>
                    {previewFile.mimeType}
                  </span>
                </div>
                {previewFile.source && (
                  <div className={embedStyles.detailField}>
                    <span className={embedStyles.detailLabel}>Nguồn</span>
                    <span className={embedStyles.detailValue}>
                      {previewFile.source}
                    </span>
                  </div>
                )}

                {/* Alt text */}
                <div className={embedStyles.detailField}>
                  <span className={embedStyles.detailLabel}>Alt text</span>
                  <input
                    className={embedStyles.detailAltInput}
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    onBlur={handleAltSave}
                    onKeyDown={(e) => e.key === "Enter" && handleAltSave()}
                    placeholder="Mô tả ảnh..."
                  />
                </div>
              </div>

              {/* Variant URLs */}
              {variantUrls.length > 0 && (
                <div className={embedStyles.variantList}>
                  <span className={embedStyles.detailLabel}>URL biến thể</span>
                  {variantUrls.map((v) => (
                    <CopyableUrlRow key={v.label} label={v.label} url={v.url} />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className={embedStyles.detailActions}>
                <button
                  className={embedStyles.detailActionBtn}
                  onClick={() => handlePick(previewFile)}
                  type="button"
                >
                  ✓ Chọn file này
                </button>
                <button
                  className={embedStyles.detailDeleteBtn}
                  onClick={() => handleDelete(previewFile.id)}
                  type="button"
                >
                  ✕ Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Copyable URL helper ──

function CopyableUrlRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className={embedStyles.variantItem}>
      <span className={embedStyles.variantLabel}>{label}</span>
      <span className={embedStyles.variantUrl} title={url}>
        {url}
      </span>
      <button
        className={`${embedStyles.copyBtn} ${copied ? embedStyles.copyBtnCopied : ""}`}
        onClick={handleCopy}
        type="button"
      >
        {copied ? "Đã copy!" : "Copy"}
      </button>
    </div>
  );
}

// ── Modal export (backward compatible) ──

export function MediaManager({
  open,
  onClose,
  onSelect,
  filter: defaultFilter = "all",
  accept,
  value,
  multi,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Thư viện ảnh & video</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <MediaManagerContent
          filter={defaultFilter}
          accept={accept}
          value={value}
          multi={multi}
          onSelect={onSelect}
          sortable={false}
          enableDetail={false}
          enableBulkDelete={false}
          enableYoutube={false}
          enableDragDrop={false}
          enableClipboard={false}
          mode="modal"
          onClose={onClose}
          onCloseDetail={undefined}
        />
      </div>
    </div>
  );
}

// ── Inline/embed export ──

export function MediaManagerEmbed(props: Omit<InlineProps, "mode">) {
  return (
    <div className={embedStyles.embed}>
      <MediaManagerContent
        {...props}
        mode="inline"
        onClose={undefined}
        onCloseDetail={undefined}
      />
    </div>
  );
}
