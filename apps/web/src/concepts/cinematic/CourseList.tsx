import { CoursesDefault } from "@/app/(nguoi-dung)/khoa-hoc/_templates/courses-default";
import type { CourseListProps } from "../types";

export function CourseList(props: CourseListProps) {
  return (
    <CoursesDefault
      settings={props.settings}
      courses={props.courses}
      faqs={props.faqs}
    />
  );
}
