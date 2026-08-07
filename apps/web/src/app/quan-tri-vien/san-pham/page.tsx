"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, extractData } from "@/lib/api";
import styles from "./page.module.scss";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  externalCheckoutUrl?: string;
  downloadFileUrl?: string;
  youtubePreviewId?: string;
  tag?: string;
  isFeaturedOnHome: number;
  isPublished: number;
  createdAt: string;
}

const formatPrice = (p: number) =>
  `${new Intl.NumberFormat("vi-VN").format(p)}đ`;

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter === "published") params.set("published", "true");
      if (statusFilter === "draft") params.set("published", "false");
      const d = await api.get<Product[] | { data: Product[] }>(
        `/api/products?${params.toString()}`,
      );
      setProducts(extractData(d));
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa sản phẩm "${title}"?`)) return;
    await api.del(`/api/products/${id}`).catch(() => {});
    fetchProducts();
  };

  const toggleFeatured = async (item: Product) => {
    await api
      .put(`/api/products/${item.id}`, {
        isFeaturedOnHome: item.isFeaturedOnHome ? false : true,
      })
      .catch(() => {});
    fetchProducts();
  };

  const filtered = products.filter(
    (p) =>
      !search || p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN");

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Sản phẩm số</h1>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() =>
            router.push("/quan-tri-vien/san-pham/tao-moi")
          }
        >
          + Tạo sản phẩm mới
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Nháp</option>
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skel-${i}`} className={styles.card}>
              <div className={styles.cardMedia}>
                <div
                  className={styles.skeleton}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.skeleton} style={{ width: "30%" }} />
                <div className={styles.skeleton} style={{ width: "70%" }} />
                <div className={styles.skeleton} style={{ width: "25%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎨</div>
          <p>Chưa có sản phẩm số nào</p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => router.push("/quan-tri-vien/san-pham/tao-moi")}
          >
            Tạo sản phẩm đầu tiên
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className={styles.cardGrid}>
          {filtered.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardMedia}>
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} />
                ) : (
                  <div className={styles.productOverlay}>🎬</div>
                )}
                {item.isFeaturedOnHome === 1 && (
                  <span className={styles.featuredBadge}>Nổi bật</span>
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.tagRow}>
                  {item.tag && (
                    <span className={styles.tagPill}>{item.tag}</span>
                  )}
                  <span
                    className={
                      item.isPublished
                        ? styles.publishedBadge
                        : styles.draftBadge
                    }
                  >
                    {item.isPublished ? "Đã xuất bản" : "Nháp"}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardPrice}>
                    {formatPrice(item.price)}
                  </span>
                  {item.externalCheckoutUrl && (
                    <span className={styles.checkoutIcon} title="Có link thanh toán">
                      ↗
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.cardAction}
                  onClick={() =>
                    router.push(`/quan-tri-vien/san-pham/${item.id}`)
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
              <th>Tag</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td className={styles.thumbCell}>
                  {item.thumbnailUrl && (
                    <img src={item.thumbnailUrl} alt="" />
                  )}
                </td>
                <td className={styles.titleCell}>
                  <span className={styles.itemTitle}>{item.title}</span>
                </td>
                <td>
                  {item.tag && (
                    <span className={styles.itemTag}>{item.tag}</span>
                  )}
                </td>
                <td>{formatPrice(item.price)}</td>
                <td>
                  <span
                    className={
                      item.isPublished
                        ? styles.publishedBadge
                        : styles.draftBadge
                    }
                  >
                    {item.isPublished ? "Đã xuất bản" : "Nháp"}
                  </span>
                </td>
                <td className={styles.dateCell}>
                  {formatDate(item.createdAt)}
                </td>
                <td className={styles.actions}>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() =>
                      router.push(`/quan-tri-vien/san-pham/${item.id}`)
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
