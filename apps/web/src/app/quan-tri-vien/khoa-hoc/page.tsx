"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Switch } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";
import { api } from "@/lib/api";
import styles from "./page.module.scss";

interface Course {
  id: string;
  slug: string;
  title: string;
  description?: string;
  basePrice: number;
  thumbnailUrl?: string;
  isPublished: number;
  isFeaturedOnHome: number;
  ratingCount: string;
  studentCount: number;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const fetchCourses = useCallback(
    async (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter === "published") params.set("published", "true");
      if (statusFilter === "draft") params.set("draft", "true");
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", String(pagination.limit));

      try {
        const d = await api.get<{
          data: Course[];
          pagination: Pagination;
        }>(`/api/courses?${params.toString()}`);
        setCourses(d.data);
        setPagination((p) => ({ ...p, ...d.pagination }));
      } catch {
        //
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search, pagination.limit],
  );

  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  const openDeleteConfirm = (id: string, title: string) => {
    setDeleteTarget({ id, title });
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.del(`/api/courses/${deleteTarget.id}`);
      setConfirmOpen(false);
      setDeleteTarget(null);
      fetchCourses(pagination.page);
    } catch {
      //
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublished = async (course: Course, checked: boolean) => {
    await api
      .put(`/api/courses/${course.id}`, {
        isPublished: checked,
      })
      .catch(() => {});
    fetchCourses(pagination.page);
  };

  const formatPrice = (price: number) =>
    `${new Intl.NumberFormat("vi-VN").format(price)}đ`;

  const resolveThumb = (item: Course): string => item.thumbnailUrl || "";

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Quản lý khóa học</h1>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => router.push("/quan-tri-vien/khoa-hoc/tao-moi")}
        >
          + Tạo khóa học mới
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.searchIcon}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.search}
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
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
        viewMode === "grid" ? (
          <div className={styles.cardGrid}>
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
                  <div className={styles.skeleton} style={{ width: "40%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.loading}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`skel-${i}`} className={styles.skeletonRow}>
                <div className={styles.skeleton} style={{ width: "60%" }} />
                <div className={styles.skeleton} style={{ width: "30%" }} />
                <div className={styles.skeleton} style={{ width: "25%" }} />
                <div className={styles.skeleton} style={{ width: "25%" }} />
                <div className={styles.skeleton} style={{ width: "20%" }} />
              </div>
            ))}
          </div>
        )
      ) : courses.length === 0 ? (
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
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <p>Chưa có khóa học nào</p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => router.push("/quan-tri-vien/khoa-hoc/tao-moi")}
          >
            Tạo khóa học đầu tiên
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <>
          <div className={styles.cardGrid}>
            {courses.map((course) => (
              <div key={course.id} className={styles.card}>
                <div className={styles.cardMedia}>
                  {course.thumbnailUrl ? (
                    <img src={resolveThumb(course)} alt={course.title} />
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
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                      </svg>
                    </div>
                  )}
                  {course.isFeaturedOnHome === 1 && (
                    <span className={styles.featuredBadge}>Nổi bật</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <span
                    className={`${styles.badge} ${course.isPublished ? styles.published : styles.draft}`}
                  >
                    {course.isPublished ? "Đã xuất bản" : "Nháp"}
                  </span>
                  <h3 className={styles.cardTitle}>{course.title}</h3>
                  {course.description && (
                    <p className={styles.cardDesc}>{course.description}</p>
                  )}
                  <div className={styles.cardMeta}>
                    <span className={styles.cardPrice}>
                      {formatPrice(course.basePrice)}
                    </span>
                    <span className={styles.cardDate}>
                      {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.cardAction}
                    onClick={() =>
                      router.push(`/quan-tri-vien/khoa-hoc/${course.slug}`)
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
                    onClick={() =>
                      router.push(`/quan-tri-vien/khoa-hoc/${course.slug}`)
                    }
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    Builder
                  </button>
                  <button
                    type="button"
                    className={`${styles.cardAction} ${styles.cardActionDanger}`}
                    onClick={() => openDeleteConfirm(course.id, course.title)}
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
          <PaginationBar
            pagination={pagination}
            onPageChange={(p) => fetchCourses(p)}
            loading={loading}
          />
        </>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên khóa học</th>
                  <th>Giá</th>
                  <th style={{ minWidth: 130 }}>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className={styles.titleCell}>
                        <span className={styles.courseTitle}>
                          {course.title}
                        </span>
                        <span className={styles.slug}>{course.slug}</span>
                      </div>
                    </td>
                    <td>{formatPrice(course.basePrice)}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${course.isPublished ? styles.published : styles.draft}`}
                      >
                        {course.isPublished ? "Đã xuất bản" : "Nháp"}
                      </span>
                    </td>
                    <td className={styles.date}>
                      {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Switch
                          checked={course.isPublished === 1}
                          size="sm"
                          onChange={(checked) =>
                            handleTogglePublished(course, checked)
                          }
                        />
                        <button
                          className={styles.editBtn}
                          onClick={() =>
                            router.push(
                              `/quan-tri-vien/khoa-hoc/${course.slug}`,
                            )
                          }
                        >
                          Sửa
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() =>
                            openDeleteConfirm(course.id, course.title)
                          }
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            pagination={pagination}
            onPageChange={(p) => fetchCourses(p)}
            loading={loading}
          />
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa khóa học"
        message={
          deleteTarget
            ? `Bạn có chắc muốn xóa khóa học "${deleteTarget.title}"? Hành động này không thể hoàn tác.`
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

function PaginationBar({
  pagination,
  onPageChange,
  loading,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  loading: boolean;
}) {
  if (pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  return (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>
        {total} khóa học — Trang {page}/{totalPages}
      </span>
      <div className={styles.paginationBtns}>
        <button
          type="button"
          className={styles.pageBtn}
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "...")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className={styles.pageDots}>
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`}
                disabled={loading}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </button>
            ),
          )}
        <button
          type="button"
          className={styles.pageBtn}
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}
