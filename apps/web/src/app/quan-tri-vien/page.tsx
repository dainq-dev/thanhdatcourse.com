"use client";

import { useEffect, useState } from "react";
import { api, extractData } from "@/lib/api";
import Link from "next/link";
import styles from "./page.module.scss";

interface Stats {
  courses: { total: number; published: number };
  posts: { total: number; published: number };
  leads: { newToday: number };
  recentPosts: { id: string; title: string; publishedAt: string }[];
  recentLeads: {
    id: string;
    customerName: string;
    createdAt: string;
    status: string;
  }[];
  recentCourses: { id: string; title: string; updatedAt: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [portfolioCount, setPortfolioCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<Stats>("/api/admin/stats"),
      api.publicGet<unknown[]>("/api/products").catch(() => []),
      api.publicGet<unknown[]>("/api/portfolios").catch(() => []),
    ])
      .then(([statsData, productData, portfolioData]) => {
        setStats(statsData);
        setProductCount(extractData(productData as []).length);
        setPortfolioCount(extractData(portfolioData as []).length);
      })
      .catch(() => setError("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className={styles.pageTitle}>Bảng điều khiển</h1>
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.cardSkeleton} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryBtn}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.grid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.courses.total ?? 0}</div>
          <div className={styles.statLabel}>Khóa học</div>
          <div className={styles.statSub}>
            {stats?.courses.published ?? 0} đã xuất bản
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.posts.total ?? 0}</div>
          <div className={styles.statLabel}>Bài viết</div>
          <div className={styles.statSub}>
            {stats?.posts.published ?? 0} đã xuất bản
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.leads.newToday ?? 0}</div>
          <div className={styles.statLabel}>Khách hàng mới</div>
          <div className={styles.statSub}>hôm nay</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{productCount ?? 0}</div>
          <div className={styles.statLabel}>Sản phẩm</div>
          <div className={styles.statSub}>sản phẩm số</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{portfolioCount ?? 0}</div>
          <div className={styles.statLabel}>Dự án</div>
          <div className={styles.statSub}>portfolio</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>–</div>
          <div className={styles.statLabel}>Media</div>
          <div className={styles.statSub}>đang phát triển</div>
        </div>
      </div>

      <div className={styles.quickLinks}>
        <Link href="/quan-tri-vien/khoa-hoc/tao-moi" className={styles.quickLink}>
          + Tạo khóa học mới
        </Link>
        <Link href="/quan-tri-vien/du-an/tao-moi" className={styles.quickLink}>
          + Tạo dự án mới
        </Link>
        <Link href="/quan-tri-vien/bai-viet/tao-moi" className={styles.quickLink}>
          + Viết bài mới
        </Link>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Bài viết mới nhất</h2>
        {stats?.recentPosts && stats.recentPosts.length > 0 ? (
          <div className={styles.list}>
            {stats.recentPosts.map((post) => (
              <div key={post.id} className={styles.listItem}>
                <span className={styles.listTitle}>{post.title}</span>
                <span className={styles.listMeta}>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
                    : "Nháp"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Chưa có bài viết nào</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Khóa học mới cập nhật</h2>
        {stats?.recentCourses && stats.recentCourses.length > 0 ? (
          <div className={styles.list}>
            {stats.recentCourses.map((course) => (
              <div key={course.id} className={styles.listItem}>
                <span className={styles.listTitle}>{course.title}</span>
                <span className={styles.listMeta}>
                  {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Chưa có khóa học nào</p>
        )}
      </div>
    </div>
  );
}
