"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";
import { ApiError, api, extractData } from "@/lib/api";
import styles from "./page.module.scss";

interface Course {
  id: string;
  title: string;
}

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
}

export default function EditPromotionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [f, setF] = useState({
    campaignName: "",
    discountPercentage: "",
    courseIds: [] as string[],
    startDate: "",
    endDate: "",
    bannerImageUrl: "",
    showOnHomepage: false,
    couponCode: "",
    usageLimit: "",
    isActive: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [promo, courseData] = await Promise.all([
          api.get<Promotion>(`/api/promotions/${id}`),
          api.get<Course[] | { data: Course[] }>("/api/courses?published=true"),
        ]);
        setCourses(extractData(courseData));
        setF({
          campaignName: promo.campaignName || "",
          discountPercentage: String(promo.discountPercentage || ""),
          courseIds: promo.course_ids || [],
          startDate: promo.startDate
            ? new Date(promo.startDate).toISOString().slice(0, 10)
            : "",
          endDate: promo.endDate
            ? new Date(promo.endDate).toISOString().slice(0, 10)
            : "",
          bannerImageUrl: promo.bannerImageUrl || "",
          showOnHomepage: promo.showOnHomepage === 1,
          couponCode: promo.couponCode || "",
          usageLimit: promo.usageLimit ? String(promo.usageLimit) : "",
          isActive: promo.isActive === 1,
        });
      } catch {
        setError("Không thể tải chiến dịch");
      } finally {
        setLoading(false);
        setLoadingCourses(false);
      }
    })();
  }, [id]);

  const onChange = (k: string, v: string | boolean | string[] | number) => {
    setF((p) => ({ ...p, [k]: v }));
  };

  const toggleCourse = (courseId: string) => {
    setF((p) => ({
      ...p,
      courseIds: p.courseIds.includes(courseId)
        ? p.courseIds.filter((cid) => cid !== courseId)
        : [...p.courseIds, courseId],
    }));
  };

  const validate = (): string | null => {
    if (!f.campaignName.trim()) return "Vui lòng nhập tên chiến dịch";
    const discount = parseInt(f.discountPercentage, 10);
    if (
      !f.discountPercentage ||
      Number.isNaN(discount) ||
      discount < 1 ||
      discount > 100
    )
      return "Giảm giá phải từ 1 đến 100%";
    if (f.courseIds.length === 0) return "Vui lòng chọn ít nhất một khóa học";
    if (
      f.startDate &&
      f.endDate &&
      new Date(f.startDate) >= new Date(f.endDate)
    )
      return "Ngày kết thúc phải sau ngày bắt đầu";
    return null;
  };

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSaving(true);
    try {
      await api.put(`/api/promotions/${id}`, {
        campaign_name: f.campaignName.trim(),
        discount_percentage: parseInt(f.discountPercentage, 10),
        start_date: f.startDate ? new Date(f.startDate).toISOString() : null,
        end_date: f.endDate
          ? new Date(
              new Date(f.endDate).setHours(23, 59, 59, 999),
            ).toISOString()
          : null,
        banner_image_url: f.bannerImageUrl || null,
        show_on_homepage: f.showOnHomepage,
        coupon_code: f.couponCode.trim() || null,
        usage_limit: f.usageLimit ? parseInt(f.usageLimit, 10) : null,
        is_active: f.isActive,
      });
      await api.put(`/api/promotions/${id}/courses`, {
        course_ids: f.courseIds,
      });
      setError("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.detail ?? "Lỗi khi lưu")
          : "Lỗi khi lưu chiến dịch",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.del(`/api/promotions/${id}`);
      router.push("/quan-tri-vien/khuyen-mai");
    } catch {
      setError("Không thể xóa chiến dịch");
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h1 className={styles.panelTitle}>Chỉnh sửa chiến dịch khuyến mãi</h1>
          <div className={styles.panelBtns}>
            <button
              type="button"
              className={styles.cBtn}
              onClick={() => router.push("/quan-tri-vien/khuyen-mai")}
            >
              Quay lại danh sách
            </button>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => setConfirmOpen(true)}
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
            <button
              type="button"
              className={styles.sBtn}
              onClick={() => save()}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.err}>
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              className={styles.errX}
            >
              ✕
            </button>
          </div>
        )}

        <div className={styles.content}>
          <form onSubmit={save}>
            <div className={styles.r}>
              <div className={styles.fld}>
                <span className={styles.lbl}>
                  Tên chiến dịch <span className={styles.req}>*</span>
                </span>
                <input
                  type="text"
                  className={styles.inp}
                  value={f.campaignName}
                  onChange={(e) => onChange("campaignName", e.target.value)}
                  required
                />
              </div>
              <div className={styles.fld}>
                <span className={styles.lbl}>
                  % Giảm giá <span className={styles.req}>*</span>
                </span>
                <input
                  type="number"
                  className={styles.inp}
                  value={f.discountPercentage}
                  onChange={(e) =>
                    onChange("discountPercentage", e.target.value)
                  }
                  required
                  min={1}
                  max={100}
                />
              </div>
            </div>

            <div className={styles.fld}>
              <span className={styles.lbl}>
                Chọn khóa học <span className={styles.req}>*</span>
              </span>
              {loadingCourses ? (
                <span className={styles.hint}>
                  Đang tải danh sách khóa học...
                </span>
              ) : courses.length === 0 ? (
                <span className={styles.hint}>Không có khóa học nào</span>
              ) : (
                <div className={styles.courseList}>
                  {courses.map((course) => (
                    <label key={course.id} className={styles.courseItem}>
                      <input
                        type="checkbox"
                        checked={f.courseIds.includes(course.id)}
                        onChange={() => toggleCourse(course.id)}
                      />
                      <span>{course.title}</span>
                    </label>
                  ))}
                </div>
              )}
              {f.courseIds.length > 0 && (
                <span className={styles.hint}>
                  Đã chọn {f.courseIds.length} khóa học
                </span>
              )}
            </div>

            <div className={styles.r}>
              <div className={styles.fld}>
                <span className={styles.lbl}>Ngày bắt đầu</span>
                <input
                  type="date"
                  className={styles.inp}
                  value={f.startDate}
                  onChange={(e) => onChange("startDate", e.target.value)}
                />
              </div>
              <div className={styles.fld}>
                <span className={styles.lbl}>Ngày kết thúc</span>
                <input
                  type="date"
                  className={styles.inp}
                  value={f.endDate}
                  onChange={(e) => onChange("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className={styles.divider} />
            <span className={styles.sectionLbl}>Banner & Hiển thị</span>

            <div className={styles.fld}>
              <span className={styles.lbl}>Banner ảnh</span>
              <MediaTrigger
                onSelect={(url) => onChange("bannerImageUrl", url)}
                value={f.bannerImageUrl}
                showPreview
                filter="image"
                accept="image/*"
              >
                {f.bannerImageUrl ? "Đổi banner" : "Chọn ảnh banner"}
              </MediaTrigger>
            </div>

            <div className={styles.toggles}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={f.showOnHomepage}
                  onChange={(e) => onChange("showOnHomepage", e.target.checked)}
                />
                <span>Hiển thị banner trang chủ</span>
              </label>
            </div>

            <div className={styles.divider} />
            <span className={styles.sectionLbl}>Mã giảm giá & Giới hạn</span>

            <div className={styles.r}>
              <div className={styles.fld}>
                <span className={styles.lbl}>Mã giảm giá</span>
                <input
                  type="text"
                  className={styles.inp}
                  value={f.couponCode}
                  onChange={(e) => onChange("couponCode", e.target.value)}
                  placeholder="VD: SUMMER2026"
                />
              </div>
              <div className={styles.fld}>
                <span className={styles.lbl}>Giới hạn số lần dùng</span>
                <input
                  type="number"
                  className={styles.inp}
                  value={f.usageLimit}
                  onChange={(e) => onChange("usageLimit", e.target.value)}
                  min={0}
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>
            </div>

            <div className={styles.divider} />
            <div className={styles.toggles}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={f.isActive}
                  onChange={(e) => onChange("isActive", e.target.checked)}
                />
                <span>Kích hoạt</span>
              </label>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.preview}>
        <div className={styles.previewHead}>
          <span className={styles.previewBadge}>Xem trước</span>
        </div>
        <div className={styles.previewBody}>
          {f.bannerImageUrl ? (
            <img src={f.bannerImageUrl} alt="" className={styles.previewImg} />
          ) : (
            <div className={styles.previewPlaceholder}>
              <span>Chưa có banner</span>
            </div>
          )}
          <div className={styles.previewInfo}>
            <h2 className={styles.previewTitle}>
              {f.campaignName || "Tên chiến dịch"}
            </h2>
            <span className={styles.previewDiscount}>
              Giảm {f.discountPercentage || "?"}%
            </span>
            {f.couponCode && (
              <span className={styles.previewCoupon}>Mã: {f.couponCode}</span>
            )}
            {f.courseIds.length > 0 && (
              <span className={styles.previewMeta}>
                {f.courseIds.length} khóa học được chọn
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa chiến dịch"
        message={`Bạn có chắc muốn xóa chiến dịch "${f.campaignName}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
