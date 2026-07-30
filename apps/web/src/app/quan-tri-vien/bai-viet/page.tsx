"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, extractData } from "@/lib/api";
import styles from "./page.module.scss";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  isPublished: number;
  author: string;
  publishedAt: string;
  views: number;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPosts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter === "published") params.set("published", "true");
    if (statusFilter === "draft") params.set("draft", "true");

    try {
      const d = await api.get<Post[] | { data: Post[] }>(
        `/api/posts?${params.toString()}`,
      );
      setPosts(extractData(d));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa bài viết "${title}"?`)) return;
    await api.del(`/api/posts/${id}`).catch(() => {});
    fetchPosts();
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Quản lý bài viết</h1>
        <button
          className={styles.addBtn}
          onClick={() => router.push("/quan-tri-vien/bai-viet/tao-moi")}
        >
          + Viết bài mới
        </button>
      </div>

      <div className={styles.filters}>
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
      ) : posts.length === 0 ? (
        <div className={styles.empty}>
          <p>Chưa có bài viết nào</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Trạng thái</th>
              <th>Ngày đăng</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className={styles.titleCell}>
                  <span className={styles.postTitle}>{post.title}</span>
                  <span className={styles.slug}>{post.slug}</span>
                </td>
                <td>
                  <span
                    className={`${styles.badge} ${post.isPublished ? styles.published : styles.draft}`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className={styles.date}>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
                <td className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() =>
                      router.push(`/quan-tri-vien/bai-viet/${post.slug}`)
                    }
                  >
                    Sửa
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(post.id, post.title)}
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
