import type { Metadata } from "next";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { api } from "@/lib/api";
import styles from "./page.module.scss";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  externalCheckoutUrl?: string;
  buttonText?: string;
}

interface SectionRow {
  id: string;
  section_type: string;
  config: string | Record<string, unknown>;
  sort_order: number;
  is_published: boolean | number;
}

async function getCourse(slug: string): Promise<Course | null> {
  try {
    const res = await api.fetch(`/api/courses/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    const json = await res.json();
    return json.data || json;
  } catch {
    return null;
  }
}

async function getSections(slug: string): Promise<SectionRow[]> {
  try {
    const res = await api.fetch(`/api/course/${slug}/sections`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data ?? []);
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
  const course = await getCourse(slug);
  if (!course) return { title: "Không tìm thấy" };
  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Không tìm thấy khóa học</h1>
        <p className={styles.notFoundDesc}>
          Khóa học bạn đang tìm không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    );
  }

  const sections = await getSections(slug);

  return <SectionRenderer sections={sections} />;
}
