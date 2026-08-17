import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import { getConcept } from "@/concepts";

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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts, settings] = await Promise.all([
    getPost(slug),
    getPublishedPosts(),
    getSiteSettings(),
  ]);
  if (!post) notFound();
  const relatedArticles = allPosts.filter((p) => p.slug !== slug).slice(0, 4);

  const { module } = getConcept(settings.site_concept);
  const BlogDetailView = module.BlogDetail;

  return <BlogDetailView post={post} relatedArticles={relatedArticles} />;
}
