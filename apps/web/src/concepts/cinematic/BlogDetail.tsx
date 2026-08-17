import type { Block } from "@workspace/types";
import Link from "next/link";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import styles from "@/app/(nguoi-dung)/bai-viet/[slug]/page.module.scss";
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
    <>
      <article className={styles.articleMain}>
        <div className={styles.articleMeta}>
          {publishedDate && <time>{publishedDate}</time>}
          <span>{post.readTime ?? 5} phút đọc</span>
        </div>

        <h1 className={styles.articleTitle}>{post.title}</h1>

        {blocks && blocks.length > 0 ? (
          <div className={styles.articleContent}>
            <BlockRenderer blocks={blocks} />
          </div>
        ) : post.excerpt ? (
          <div
            className={styles.articleContent}
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
        ) : (
          <div className={styles.articleContent}>
            <p>Nội dung đang được cập nhật...</p>
          </div>
        )}

        <hr className={styles.divider} />
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
                <div className={styles.relatedThumb}>
                  <img
                    src={related.thumbnailUrl || "/placeholder-post.jpg"}
                    alt=""
                  />
                </div>
                <h4 className={styles.relatedCardTitle}>{related.title}</h4>
                <span className={styles.relatedMeta}>
                  {related.readTime ?? 5} phút đọc
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
