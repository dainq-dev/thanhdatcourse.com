import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import { getConcept } from "@/concepts";

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
  const [posts, settings] = await Promise.all([getPosts(), getSiteSettings()]);
  const { module } = getConcept(settings.site_concept);
  const BlogView = module.Blog;

  return <BlogView posts={posts} />;
}
