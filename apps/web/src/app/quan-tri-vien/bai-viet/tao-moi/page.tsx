"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { SharedPostForm } from "../shared-form";

export default function CreatePostPage() {
  const router = useRouter();

  const handleSave = async (body: Record<string, unknown>) => {
    await api.post("/api/posts", body);
    router.push("/quan-tri-vien/bai-viet");
  };

  return (
    <SharedPostForm mode="create" onSave={handleSave} onPublish={handleSave} />
  );
}
