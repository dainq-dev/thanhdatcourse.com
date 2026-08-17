import type { Block } from "@workspace/types";
import Link from "next/link";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import styles from "./styles.module.scss";
import type { BlogDetailProps } from "../types";

export function BlogDetail({ post, relatedArticles }: BlogDetailProps) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
    : null;

  let blocks: Block[] | null = null;
  if (post.contentBlocks) {
    try {
      blocks = JSON.parse(post.contentBlocks);
    } catch {
      blocks = null;
    }
  }

  return (
    <div className={styles.root}>
      <article className={styles.article}>
        <div className={styles.articleMeta}>
          {publishedDate && <time>{publishedDate}</time>}
          <span> · {post.readTime ?? 5} phút đọc</span>
        </div>
        <h1 className={styles.articleTitle}>{post.title}</h1>
        <div className={styles.articleBody}>
          {blocks && blocks.length > 0 ? (
            <BlockRenderer blocks={blocks} />
          ) : post.excerpt ? (
            <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
          ) : (
            <p>Nội dung đang được cập nhật...</p>
          )}
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <section className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>Bài viết liên quan</h3>
          <div className={styles.relatedGrid}>
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/bai-viet/${related.slug}`}
                className={styles.relatedCard}
              >
                <h4 className={styles.relatedCardTitle}>{related.title}</h4>
                <span className={styles.relatedMeta}>
                  {related.readTime ?? 5} phút đọc
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
