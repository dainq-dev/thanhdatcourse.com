import { PageHeader } from "@workspace/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import styles from "./page.module.scss";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumbnailUrl: string;
  publishedAt: string;
  readTime: number;
}

async function getPosts(): Promise<Post[]> {
  try {
    return await api.fetchData<Post>("/api/posts?published=true", {
      next: { revalidate: 60 },
    });
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Blog",
  description: "Bài viết chia sẻ kiến thức quay dựng, chỉnh màu chuyên nghiệp.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <PageHeader title="Blog" />
      <section className={styles.articleGrid}>
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/bai-viet/${post.slug}`}
            className={styles.card}
          >
            <div className={styles.thumb}>
              {post.thumbnailUrl ? (
                <img src={post.thumbnailUrl} alt={post.title} loading="lazy" />
              ) : (
                <div className={styles.thumbPlaceholder} />
              )}
            </div>
            <div className={styles.body}>
              <h3 className={styles.title}>{post.title}</h3>
              <p className={styles.excerpt}>{post.excerpt}</p>
              <span className={styles.readMore}>Đọc thêm »</span>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
