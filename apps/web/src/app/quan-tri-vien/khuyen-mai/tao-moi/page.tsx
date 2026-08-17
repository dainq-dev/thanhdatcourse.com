"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import { ApiError, api, extractData } from "@/lib/api";
import styles from "./page.module.scss";

interface Course {
  id: string;
  title: string;
}

export default function CreatePromotionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

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
        const d = await api.get<Course[] | { data: Course[] }>(
          "/api/courses?published=true",
        );
        setCourses(extractData(d));
      } catch {
        //
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, []);

  const onChange = (k: string, v: string | boolean | string[] | number) => {
    setF((p) => ({ ...p, [k]: v }));
  };

  const toggleCourse = (courseId: string) => {
    setF((p) => ({
      ...p,
      courseIds: p.courseIds.includes(courseId)
        ? p.courseIds.filter((id) => id !== courseId)
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSaving(true);
    try {
      await api.post("/api/promotions", {
        campaign_name: f.campaignName.trim(),
        discount_percentage: parseInt(f.discountPercentage, 10),
        course_ids: f.courseIds,
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
      router.push("/quan-tri-vien/khuyen-mai");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.detail ?? "Lỗi khi tạo")
          : "Lỗi khi tạo chiến dịch",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h1 className={styles.panelTitle}>Tạo chiến dịch khuyến mãi</h1>
          <div className={styles.panelBtns}>
            <button
              type="button"
              className={styles.cBtn}
              onClick={() => router.push("/quan-tri-vien/khuyen-mai")}
            >
              Hủy
            </button>
            <button
              type="submit"
              form="create-promotion-form"
              className={styles.sBtn}
              disabled={saving}
            >
              {saving ? "Đang tạo..." : "Tạo chiến dịch"}
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
          <form id="create-promotion-form" onSubmit={submit}>
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
                  placeholder="Nhập tên chiến dịch"
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
                  placeholder="1-100"
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
    </div>
  );
}
