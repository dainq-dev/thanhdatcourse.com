"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, extractData } from "@/lib/api";
import styles from "./page.module.scss";

interface Course {
  id: string;
  slug: string;
  title: string;
  basePrice: number;
  isPublished: number;
  isFeaturedOnHome: number;
  ratingCount: string;
  studentCount: number;
  updatedAt: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCourses = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter === "published") params.set("published", "true");
    if (statusFilter === "draft") params.set("draft", "true");
    if (search) params.set("search", search);

    try {
      const d = await api.get<Course[] | { data: Course[] }>(
        `/api/courses?${params.toString()}`,
      );
      setCourses(extractData(d));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [statusFilter, search]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa khóa học "${title}"?`)) return;
    await api.del(`/api/courses/${id}`).catch(() => {});
    fetchCourses();
  };

  const formatPrice = (price: number) =>
    `${new Intl.NumberFormat("vi-VN").format(price)}đ`;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Quản lý khóa học</h1>
        <button
          className={styles.addBtn}
          onClick={() => router.push("/quan-tri-vien/khoa-hoc/tao-moi")}
        >
          + Tạo khóa học mới
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
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : courses.length === 0 ? (
        <div className={styles.empty}>
          <p>Chưa có khóa học nào</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên khóa học</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td className={styles.titleCell}>
                  <span className={styles.courseTitle}>{course.title}</span>
                  <span className={styles.slug}>{course.slug}</span>
                </td>
                <td>{formatPrice(course.basePrice)}</td>
                <td>
                  <span
                    className={`${styles.badge} ${course.isPublished ? styles.published : styles.draft}`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className={styles.date}>
                  {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
                </td>
                <td className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() =>
                      router.push(`/quan-tri-vien/khoa-hoc/${course.slug}`)
                    }
                  >
                    Sửa
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(course.id, course.title)}
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
