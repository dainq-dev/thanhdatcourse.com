import Link from "next/link";
import styles from "./styles.module.scss";
import type { BlogProps } from "../types";

export function Blog({ posts }: BlogProps) {
  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Blog</h1>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.masonry}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/bai-viet/${post.slug}`}
                className={styles.masonryItem}
              >
                <div className={styles.card}>
                  {post.thumbnailUrl && (
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className={styles.cardImg}
                    />
                  )}
                  <div className={styles.cardOverlay} />
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    <span className={styles.cardMeta}>
                      {post.readTime ?? 5} phút đọc
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
