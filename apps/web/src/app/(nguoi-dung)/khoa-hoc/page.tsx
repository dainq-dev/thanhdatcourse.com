import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import { getConcept } from "@/concepts";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  ratingCount?: string;
  externalCheckoutUrl?: string;
  isComboOnly?: number;
  buttonText?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

async function getCourses(): Promise<Course[]> {
  try {
    return await api.fetchData<Course>("/api/courses?published=true", {
      next: { revalidate: 60 },
    });
  } catch {
    return [];
  }
}

async function getFAQs(): Promise<FAQ[]> {
  try {
    return await api.fetchData<FAQ>("/api/faqs", {
      next: { revalidate: 300 },
    });
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Khóa học",
  description:
    "Danh sách khóa học quay dựng, chỉnh màu chuyên nghiệp từ Minh Travel.",
};

export default async function CoursesPage() {
  const [courses, faqs, settings] = await Promise.all([
    getCourses(),
    getFAQs(),
    getSiteSettings(),
  ]);

  const { module } = getConcept(settings.site_concept);
  const CourseListView = module.CourseList;

  return <CourseListView settings={settings} courses={courses} faqs={faqs} />;
}
