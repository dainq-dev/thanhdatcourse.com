"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";
import { api, extractData } from "@/lib/api";
import styles from "./page.module.scss";

interface Promotion {
  id: string;
  campaignName: string;
  discountPercentage: number;
  course_ids?: string[];
  startDate?: string;
  endDate?: string;
  isActive: number;
  bannerImageUrl?: string;
  showOnHomepage: number;
  couponCode?: string;
  usageLimit?: number;
  createdAt: string;
}

type StatusFilter = "all" | "active" | "upcoming" | "ended";

function getStatus(item: Promotion): StatusFilter {
  if (!item.isActive) return "all";
  const now = Date.now();
  const start = item.startDate ? new Date(item.startDate).getTime() : null;
  const end = item.endDate ? new Date(item.endDate).getTime() : null;
  if (end && now > end) return "ended";
  if (start && now < start) return "upcoming";
  return "active";
}

function getStatusLabel(status: StatusFilter, inactive: boolean): string {
  if (inactive) return "Không hoạt động";
  switch (status) {
    case "active":
      return "Đang hoạt động";
    case "upcoming":
      return "Sắp diễn ra";
    case "ended":
      return "Đã kết thúc";
    default:
      return "Không hoạt động";
  }
}

const FILTER_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "ended", label: "Đã kết thúc" },
];

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get<Promotion[] | { data: Promotion[] }>(
        "/api/promotions",
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

  const filtered = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((item) => {
      const raw = getStatus(item);
      if (statusFilter === "active")
        return item.isActive === 1 && raw === "active";
      if (statusFilter === "upcoming")
        return item.isActive === 1 && raw === "upcoming";
      if (statusFilter === "ended") return raw === "ended";
      return true;
    });
  }, [items, statusFilter]);

  const openDeleteConfirm = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.del(`/api/promotions/${deleteTarget.id}`);
      setConfirmOpen(false);
      setDeleteTarget(null);
      fetchItems();
    } catch {
      //
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (item: Promotion) => {
    setTogglingId(item.id);
    try {
      await api.patch(`/api/promotions/${item.id}/toggle`, {
        is_active: item.isActive === 0,
      });
      fetchItems();
    } catch {
      //
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  const courseCount = (item: Promotion) =>
    item.course_ids && item.course_ids.length > 0
      ? item.course_ids.length
      : "—";

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Chương trình khuyến mãi</h1>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => router.push("/quan-tri-vien/khuyen-mai/tao-moi")}
        >
          + Tạo chiến dịch
        </button>
      </div>

      <div className={styles.filterTabs}>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`${styles.filterTab} ${statusFilter === tab.value ? styles.filterTabActive : ""}`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-${i}`} className={styles.skeletonRow}>
              <div className={styles.skeleton} style={{ width: "25%" }} />
              <div className={styles.skeleton} style={{ width: "10%" }} />
              <div className={styles.skeleton} style={{ width: "8%" }} />
              <div className={styles.skeleton} style={{ width: "20%" }} />
              <div className={styles.skeleton} style={{ width: "12%" }} />
              <div className={styles.skeleton} style={{ width: "15%" }} />
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
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <p>Chưa có chiến dịch khuyến mãi nào</p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => router.push("/quan-tri-vien/khuyen-mai/tao-moi")}
          >
            Tạo chiến dịch đầu tiên
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên chiến dịch</th>
                <th>Giảm giá</th>
                <th>Số khóa học</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const status = getStatus(item);
                const inactive = item.isActive === 0;
                return (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.titleCell}>
                        <span className={styles.campaignName}>
                          {item.campaignName}
                        </span>
                        {item.couponCode && (
                          <span className={styles.slug}>
                            Mã: {item.couponCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles.discount}>
                        {item.discountPercentage}%
                      </span>
                    </td>
                    <td>{courseCount(item)}</td>
                    <td className={styles.date}>
                      {formatDate(item.startDate)} → {formatDate(item.endDate)}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          inactive
                            ? styles.badgeInactive
                            : status === "active"
                              ? styles.badgeActive
                              : status === "upcoming"
                                ? styles.badgeUpcoming
                                : styles.badgeEnded
                        }`}
                      >
                        {getStatusLabel(status, inactive)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.toggleBtn}
                          onClick={() => handleToggle(item)}
                          disabled={togglingId === item.id}
                          title={item.isActive ? "Tắt" : "Bật"}
                        >
                          {togglingId === item.id ? (
                            <span className={styles.toggleSpinner} />
                          ) : item.isActive ? (
                            "Tắt"
                          ) : (
                            "Bật"
                          )}
                        </button>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() =>
                            router.push(`/quan-tri-vien/khuyen-mai/${item.id}`)
                          }
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() =>
                            openDeleteConfirm(item.id, item.campaignName)
                          }
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa chiến dịch"
        message={
          deleteTarget
            ? `Bạn có chắc muốn xóa chiến dịch "${deleteTarget.name}"? Hành động này không thể hoàn tác.`
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
