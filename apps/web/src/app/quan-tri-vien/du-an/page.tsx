"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";
import { api, extractData } from "@/lib/api";
import { youtubeThumb } from "@/lib/youtube";
import styles from "./page.module.scss";

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  fullVideoUrl?: string;
  youtubeVideoId?: string;
  isFeaturedOnHome: number;
  featuredOrder: number;
  createdAt: string;
}

const CATEGORIES = [
  "Travel",
  "TVC",
  "Documentary",
  "Tutorial",
  "Automotive",
  "Food",
  "Fashion",
  "Short Video",
];

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
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
      const d = await api.get<Portfolio[] | { data: Portfolio[] }>(
        "/api/portfolios",
      );
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
      await api.del(`/api/portfolios/${deleteTarget.id}`);
      setConfirmOpen(false);
      setDeleteTarget(null);
      fetchItems();
    } catch {
      //
    } finally {
      setDeleting(false);
    }
  };

  const toggleFeatured = async (item: Portfolio) => {
    await api
      .put(`/api/portfolios/${item.id}`, {
        isFeaturedOnHome: item.isFeaturedOnHome === 0,
      })
      .catch(() => {});
    fetchItems();
  };

  const filtered = items
    .filter((i) => (catFilter === "all" ? true : i.category === catFilter))
    .filter(
      (i) => !search || i.title.toLowerCase().includes(search.toLowerCase()),
    );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");

  const resolveThumb = (item: Portfolio): string => {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    if (item.youtubeVideoId) return youtubeThumb(item.youtubeVideoId);
    return "";
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Dự án thực hiện</h1>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => router.push("/quan-tri-vien/du-an/tao-moi")}
        >
          + Tạo dự án mới
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
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
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
          <p>Chưa có dự án nào</p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => router.push("/quan-tri-vien/du-an/tao-moi")}
          >
            Tạo dự án đầu tiên
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className={styles.cardGrid}>
          {filtered.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardMedia}>
                {item.youtubeVideoId || item.thumbnailUrl ? (
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
                {item.youtubeVideoId && (
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
                {item.isFeaturedOnHome === 1 && (
                  <span className={styles.featuredBadge}>Nổi bật</span>
                )}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.categoryTag}>{item.category}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
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
                  onClick={() => router.push(`/quan-tri-vien/du-an/${item.id}`)}
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
                  onClick={() => toggleFeatured(item)}
                  title={item.isFeaturedOnHome ? "Bỏ nổi bật" : "Đặt nổi bật"}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={item.isFeaturedOnHome ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
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
              <th>Danh mục</th>
              <th>Nổi bật</th>
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
                  <span className={styles.categoryTag}>{item.category}</span>
                </td>
                <td>
                  {item.isFeaturedOnHome === 1 && (
                    <span className={`${styles.badge} ${styles.badgeFeatured}`}>
                      Nổi bật
                    </span>
                  )}
                </td>
                <td className={styles.itemDate}>
                  {formatDate(item.createdAt)}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() =>
                        router.push(`/quan-tri-vien/du-an/${item.id}`)
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
        title="Xóa dự án"
        message={
          deleteTarget
            ? `Bạn có chắc muốn xóa dự án "${deleteTarget.title}"? Hành động này không thể hoàn tác.`
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
