import { PageHeader } from "@workspace/ui";
import Link from "next/link";
import styles from "@/app/(nguoi-dung)/bai-viet/page.module.scss";
import type { BlogProps } from "../types";

export function Blog({ posts }: BlogProps) {
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
