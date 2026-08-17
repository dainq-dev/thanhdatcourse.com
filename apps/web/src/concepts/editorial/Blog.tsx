import Link from "next/link";
import styles from "./styles.module.scss";
import type { BlogProps } from "../types";

export function Blog({ posts }: BlogProps) {
  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Blog</span>
          <h1 className={styles.heroTitle}>Bài viết</h1>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIndex}>Mới nhất</span>
            <h2 className={styles.sectionTitle}>Kiến thức & câu chuyện</h2>
          </div>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/bai-viet/${post.slug}`}
              className={styles.listRow}
            >
              <div>
                <h3 className={styles.listTitle}>{post.title}</h3>
                <p className={styles.listDesc}>{post.excerpt}</p>
              </div>
              <span className={styles.listMeta}>
                {post.readTime ?? 5} phút đọc
              </span>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className={styles.empty}>Chưa có bài viết</p>
          )}
        </div>
      </section>
    </div>
  );
}
