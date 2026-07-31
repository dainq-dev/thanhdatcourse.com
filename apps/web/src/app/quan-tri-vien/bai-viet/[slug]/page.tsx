"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SharedPostForm } from "../shared-form";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentBlocks: string | null;
  author: string;
  readTime: number;
  isPublished: number;
  thumbnailUrl?: string;
  seoDescription?: string;
  categoryId?: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [postId, setPostId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Post>(`/api/posts/${slug}`)
      .then((post) => {
        setPostId(post.id);
        let blocks: any[] = [];
        if (post.contentBlocks) {
          try {
            const p = JSON.parse(post.contentBlocks);
            if (Array.isArray(p)) blocks = p;
          } catch {}
        }
        setInitialData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          author: post.author || "minhtravel",
          blocks,
          thumbnailUrl: post.thumbnailUrl || "",
          seoDescription: post.seoDescription || "",
          categoryId: post.categoryId || "",
          isPublished: post.isPublished === 1,
        });
      })
      .catch(() => setError("Không thể tải bài viết"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async (body: Record<string, unknown>) => {
    await api.put(`/api/posts/${postId}`, body);
    router.push("/quan-tri-vien/bai-viet");
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    await api.del(`/api/posts/${postId}`);
    router.push("/quan-tri-vien/bai-viet");
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#C53030" }}>
        {error}
      </div>
    );

  return (
    <SharedPostForm
      mode="edit"
      initialData={initialData}
      postId={postId}
      onSave={handleSave}
      onPublish={handleSave}
      onDelete={handleDelete}
    />
  );
}
