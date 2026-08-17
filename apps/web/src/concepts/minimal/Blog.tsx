import Link from "next/link";
import styles from "./styles.module.scss";
import type { BlogProps } from "../types";

export function Blog({ posts }: BlogProps) {
  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroLabel}>Blog</span>
          <h1 className={styles.heroTitle}>Bài viết</h1>
        </div>
      </header>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.blogGrid}`}>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/bai-viet/${post.slug}`}
              className={styles.blogCard}
            >
              <h2 className={styles.blogTitle}>{post.title}</h2>
              <p className={styles.blogExcerpt}>{post.excerpt}</p>
              <span className={styles.blogReadMore}>Đọc thêm →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
