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
          <div className={styles.bentoGrid}>
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/bai-viet/${post.slug}`}
                className={`${styles.tile} ${
                  i === 0 ? styles.tileLg : styles.tileMd
                }`}
              >
                {post.thumbnailUrl && (
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className={styles.tileImg}
                  />
                )}
                <div className={styles.tileOverlay} />
                <div className={styles.tileContent}>
                  <h2 className={styles.tileTitle}>{post.title}</h2>
                  <p className={styles.tileDesc}>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
