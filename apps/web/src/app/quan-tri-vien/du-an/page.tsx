"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, extractData } from "@/lib/api";
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

function extractYoutubeId(input: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1] ?? input;
  }
  return input;
}

function youtubeThumb(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const d = await api.get<Portfolio[] | { data: Portfolio[] }>(
        `/api/portfolios?${params.toString()}`,
      );
      setItems(extractData(d));
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa dự án "${title}"?`)) return;
    await api.del(`/api/portfolios/${id}`).catch(() => {});
    fetchItems();
  };

  const toggleFeatured = async (item: Portfolio) => {
    await api
      .put(`/api/portfolios/${item.id}`, {
        isFeaturedOnHome: item.isFeaturedOnHome ? false : true,
      })
      .catch(() => {});
    fetchItems();
  };

  const filtered = items
    .filter((i) => (catFilter === "all" ? true : i.category === catFilter))
    .filter(
      (i) =>
        !search ||
        i.title.toLowerCase().includes(search.toLowerCase()),
    );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN");

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Dự án thực hiện</h1>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() =>
            router.push("/quan-tri-vien/du-an/tao-moi")
          }
        >
          + Tạo dự án mới
        </button>
      </div>

      <div className={styles.filters}>
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
        <div className={styles.viewToggles}>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
            onClick={() => setViewMode("grid")}
            title="Lưới"
          >
            ▦
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === "table" ? styles.viewBtnActive : ""}`}
            onClick={() => setViewMode("table")}
            title="Bảng"
          >
            ☰
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skel-${i}`} className={styles.card}>
              <div className={styles.cardMedia}>
                <div className={styles.skeleton} style={{ width: "100%", height: "100%" }} />
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
          <div className={styles.emptyIcon}>🎬</div>
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
                {item.youtubeVideoId ? (
                  <>
                    <img
                      src={youtubeThumb(item.youtubeVideoId)}
                      alt={item.title}
                    />
                    <div className={styles.playOverlay}>▶</div>
                  </>
                ) : item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} />
                ) : (
                  <div className={styles.playOverlay}>▶</div>
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
                  onClick={() =>
                    router.push(`/quan-tri-vien/du-an/${item.id}`)
                  }
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className={styles.cardAction}
                  onClick={() => toggleFeatured(item)}
                >
                  {item.isFeaturedOnHome ? "★" : "☆"}
                </button>
                <button
                  type="button"
                  className={`${styles.cardAction} ${styles.cardActionDanger}`}
                  onClick={() => handleDelete(item.id, item.title)}
                >
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
                <td className={styles.thumbCell}>
                  <img
                    src={
                      item.youtubeVideoId
                        ? youtubeThumb(item.youtubeVideoId)
                        : item.thumbnailUrl || ""
                    }
                    alt=""
                  />
                </td>
                <td className={styles.titleCell}>
                  <span className={styles.itemTitle}>{item.title}</span>
                </td>
                <td>
                  <span className={styles.categoryTag}>{item.category}</span>
                </td>
                <td>
                  {item.isFeaturedOnHome === 1 && (
                    <span className={`${styles.badge} ${styles.badgeFeatured}`}>
                      ★ Nổi bật
                    </span>
                  )}
                </td>
                <td className={styles.itemDate}>
                  {formatDate(item.createdAt)}
                </td>
                <td className={styles.actions}>
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
                    onClick={() => handleDelete(item.id, item.title)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
