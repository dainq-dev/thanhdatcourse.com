import type { Block } from "@workspace/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { api } from "@/lib/api";
import styles from "./page.module.scss";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentBlocks?: string;
  thumbnailUrl?: string;
  seoDescription?: string;
  author: string;
  readTime: number;
  publishedAt?: string;
}

interface PostListItem {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string;
  readTime: number;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await api.fetch(`/api/posts/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getPublishedPosts(): Promise<PostListItem[]> {
  try {
    const res = await api.fetch("/api/posts?published=true&limit=100", {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.data || data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Không tìm thấy" };
  return {
    title: post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.seoDescription || post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const allPosts = await getPublishedPosts();
  const relatedArticles = allPosts
    .filter((p) => p.slug !== params.slug)
    .slice(0, 4);

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
          <span>{post.readTime} phút đọc</span>
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
                  {related.readTime} phút đọc
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
