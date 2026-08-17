import type { Metadata } from "next";
import { getCoursesEngine, type CoursesTemplateId } from "@/lib/layout-engine";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import { CoursesDefault } from "./_templates/courses-default";
import { CoursesMinimal } from "./_templates/courses-minimal";
import { CoursesFull } from "./_templates/courses-full";

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

const COURSES_TEMPLATES = {
  default: CoursesDefault,
  minimal: CoursesMinimal,
  full: CoursesFull,
} as const;

export default async function CoursesPage() {
  const [courses, faqs, settings] = await Promise.all([
    getCourses(),
    getFAQs(),
    getSiteSettings(),
  ]);

  const templateId = (settings.courses_template || "default") as CoursesTemplateId;
  const Template = COURSES_TEMPLATES[templateId] ?? CoursesDefault;
  const engine = getCoursesEngine(settings);

  return <Template settings={settings} courses={courses} faqs={faqs} engine={engine} />;
}
