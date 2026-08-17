"use client";

import { formatVND } from "@workspace/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";
import { api, extractData } from "@/lib/api";
import { youtubeThumb } from "@/lib/youtube";
import styles from "./page.module.scss";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  thumbnailUrl?: string;
  youtubePreviewId?: string;
  externalCheckoutUrl?: string;
  tag?: string;
  isPublished: number;
  isFeaturedOnHome: number;
  createdAt: string;
}

const TAG_OPTIONS = ["Tất cả", "LUT", "Preset"];

export default function AdminPresetsLutsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("Tất cả");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get<Product[] | { data: Product[] }>("/api/products");
      setItems(extractData(d));
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openDeleteConfirm = (id: string, title: string) => {
    setDeleteTarget({ id, title });
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.del(`/api/products/${deleteTarget.id}`);
      setConfirmOpen(false);
      setDeleteTarget(null);
      fetchItems();
    } catch {
      //
    } finally {
      setDeleting(false);
    }
  };

  const togglePublished = async (item: Product) => {
    await api
      .put(`/api/products/${item.id}`, {
        isPublished: item.isPublished === 0,
      })
      .catch(() => {});
    fetchItems();
  };

  const filtered = items
    .filter((i) => (tagFilter === "Tất cả" ? true : i.tag === tagFilter))
    .filter(
      (i) => !search || i.title.toLowerCase().includes(search.toLowerCase()),
    );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");

  const resolveThumb = (item: Product): string => {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    if (item.youtubePreviewId) return youtubeThumb(item.youtubePreviewId);
    return "";
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Presets &amp; LUTs</h1>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => router.push("/quan-tri-vien/presets-luts/tao-moi")}
        >
          + Tạo sản phẩm mới
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchFilter}>
          <input
            type="text"
            className={styles.search}
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={styles.filter}
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            {TAG_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === "Tất cả" ? "Tất cả tag" : t}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.viewToggles}>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
            onClick={() => setViewMode("grid")}
            title="Lưới"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="0.5"
                y="0.5"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
              />
              <rect
                x="9.5"
                y="0.5"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
              />
              <rect
                x="0.5"
                y="9.5"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
              />
              <rect
                x="9.5"
                y="9.5"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === "table" ? styles.viewBtnActive : ""}`}
            onClick={() => setViewMode("table")}
            title="Bảng"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line
                x1="1"
                y1="3"
                x2="15"
                y2="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="1"
                y1="8"
                x2="15"
                y2="8"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="1"
                y1="13"
                x2="15"
                y2="13"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skel-${i}`} className={styles.card}>
              <div className={styles.cardMedia}>
                <div
                  className={styles.skeleton}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.skeleton} style={{ width: "30%" }} />
                <div className={styles.skeleton} style={{ width: "80%" }} />
                <div className={styles.skeleton} style={{ width: "60%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            >
              <rect x="2" y="2" width="20" height="20" rx="3" />
              <polygon points="10,8 16,12 10,16" fill="currentColor" />
            </svg>
          </div>
          <p>Chưa có sản phẩm nào</p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => router.push("/quan-tri-vien/presets-luts/tao-moi")}
          >
            Tạo sản phẩm đầu tiên
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className={styles.cardGrid}>
          {filtered.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardMedia}>
                {item.youtubePreviewId || item.thumbnailUrl ? (
                  <img src={resolveThumb(item)} alt={item.title} />
                ) : (
                  <div className={styles.mediaPlaceholder}>
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
                {item.youtubePreviewId && (
                  <div className={styles.playOverlay}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <polygon points="8,5 19,12 8,19" />
                    </svg>
                  </div>
                )}
                {item.tag && (
                  <span className={styles.tagBadgeCard}>{item.tag}</span>
                )}
                <span
                  className={`${styles.publishBadge} ${item.isPublished === 1 ? styles.publishBadgeActive : styles.publishBadgeDraft}`}
                >
                  {item.isPublished === 1 ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </div>
              <div className={styles.cardBody}>
                <span className={styles.tagBadge}>
                  {item.tag || "Chưa phân loại"}
                </span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardPrice}>{formatVND(item.price)}</p>
                {item.description && (
                  <p className={styles.cardDesc}>{item.description}</p>
                )}
                <span className={styles.cardDate}>
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.cardAction}
                  onClick={() =>
                    router.push(`/quan-tri-vien/presets-luts/${item.id}`)
                  }
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
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Sửa
                </button>
                <button
                  type="button"
                  className={styles.cardAction}
                  onClick={() => togglePublished(item)}
                  title={item.isPublished ? "Ẩn" : "Xuất bản"}
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
                    {item.isPublished === 1 ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    ) : (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    )}
                    {item.isPublished === 1 ? (
                      <line x1="1" y1="1" x2="23" y2="23" />
                    ) : (
                      <circle cx="12" cy="12" r="3" />
                    )}
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${styles.cardAction} ${styles.cardActionDanger}`}
                  onClick={() => openDeleteConfirm(item.id, item.title)}
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Tiêu đề</th>
              <th>Tag</th>
              <th>Giá</th>
              <th>Xuất bản</th>
              <th>Ngày tạo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className={styles.thumbCell}>
                    <img src={resolveThumb(item)} alt="" />
                  </div>
                </td>
                <td>
                  <div className={styles.titleCell}>
                    <span className={styles.itemTitle}>{item.title}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeTag}`}>
                    {item.tag || "—"}
                  </span>
                </td>
                <td>
                  <span className={styles.itemPrice}>
                    {formatVND(item.price)}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.badge} ${item.isPublished === 1 ? styles.badgePublished : styles.badgeDraft}`}
                  >
                    {item.isPublished === 1 ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </td>
                <td className={styles.itemDate}>
                  {formatDate(item.createdAt)}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.publishToggleBtn}
                      onClick={() => togglePublished(item)}
                    >
                      {item.isPublished === 1 ? "Ẩn" : "Xuất bản"}
                    </button>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() =>
                        router.push(`/quan-tri-vien/presets-luts/${item.id}`)
                      }
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => openDeleteConfirm(item.id, item.title)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa sản phẩm"
        message={
          deleteTarget
            ? `Bạn có chắc muốn xóa sản phẩm "${deleteTarget.title}"? Hành động này không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
