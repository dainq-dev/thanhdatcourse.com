"use client";

import type { ReactElement } from "react";
import type { SectionType } from "./types";

interface PreviewProps {
  type: SectionType;
}

const SKELETON_PREVIEWS: Record<SectionType, () => ReactElement> = {
  hero_banner: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0"
        y="0"
        width="240"
        height="110"
        rx="6"
        fill="currentColor"
        opacity="0.06"
      />
      <rect
        x="20"
        y="22"
        width="140"
        height="14"
        rx="3"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="20"
        y="42"
        width="100"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.12"
      />
      <rect
        x="20"
        y="58"
        width="64"
        height="22"
        rx="11"
        fill="currentColor"
        opacity="0.2"
      />
      <circle cx="205" cy="45" r="20" fill="currentColor" opacity="0.08" />
      <rect
        x="195"
        y="63"
        width="30"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.08"
      />
    </svg>
  ),

  brand_logos: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="60"
        y="8"
        width="120"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.12"
      />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={10 + i * 58}
            y="34"
            width="48"
            height="28"
            rx="4"
            fill="currentColor"
            opacity="0.06"
          />
          <rect
            x={18 + i * 58}
            y="46"
            width="32"
            height="5"
            rx="1.5"
            fill="currentColor"
            opacity="0.12"
          />
        </g>
      ))}
      <rect
        x="40"
        y="78"
        width="80"
        height="12"
        rx="6"
        fill="currentColor"
        opacity="0.08"
      />
      <rect
        x="55"
        y="82"
        width="50"
        height="5"
        rx="1.5"
        fill="currentColor"
        opacity="0.1"
      />
      <rect
        x="130"
        y="80"
        width="60"
        height="6"
        rx="2"
        fill="currentColor"
        opacity="0.1"
      />
      <rect
        x="140"
        y="92"
        width="40"
        height="5"
        rx="1.5"
        fill="currentColor"
        opacity="0.08"
      />
    </svg>
  ),

  countdown_offer: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0"
        y="0"
        width="240"
        height="120"
        rx="6"
        fill="currentColor"
        opacity="0.04"
      />
      <rect
        x="10"
        y="10"
        width="100"
        height="60"
        rx="4"
        fill="currentColor"
        opacity="0.08"
      />
      <rect
        x="125"
        y="16"
        width="100"
        height="10"
        rx="3"
        fill="currentColor"
        opacity="0.18"
      />
      <rect
        x="125"
        y="32"
        width="70"
        height="6"
        rx="2"
        fill="currentColor"
        opacity="0.1"
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={125 + i * 34}
            y="46"
            width="28"
            height="22"
            rx="4"
            fill="currentColor"
            opacity="0.08"
          />
          <rect
            x={130 + i * 34}
            y="51"
            width="18"
            height="8"
            rx="2"
            fill="currentColor"
            opacity="0.14"
          />
        </g>
      ))}
      <rect
        x="145"
        y="82"
        width="50"
        height="16"
        rx="8"
        fill="currentColor"
        opacity="0.14"
      />
    </svg>
  ),

  trust_badges: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle
            cx={40 + i * 80}
            cy="40"
            r="14"
            fill="currentColor"
            opacity="0.08"
          />
          <rect
            x={26 + i * 80}
            y="60"
            width="28"
            height="8"
            rx="2"
            fill="currentColor"
            opacity="0.06"
          />
          <rect
            x={8 + i * 80}
            y="78"
            width="64"
            height="12"
            rx="3"
            fill="currentColor"
            opacity="0.1"
          />
        </g>
      ))}
    </svg>
  ),

  curriculum_highlights: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={8 + i * 78}
            y="10"
            width="72"
            height="80"
            rx="6"
            fill="currentColor"
            opacity="0.05"
          />
          <rect
            x={20 + i * 78}
            y="22"
            width="22"
            height="22"
            rx="4"
            fill="currentColor"
            opacity="0.12"
          />
          <rect
            x={18 + i * 78}
            y="23"
            width="10"
            height="14"
            rx="2"
            fill="currentColor"
            opacity="0.08"
          />
          <rect
            x={50 + i * 78}
            y="24"
            width="22"
            height="6"
            rx="2"
            fill="currentColor"
            opacity="0.14"
          />
          <rect
            x={18 + i * 78}
            y="54"
            width="52"
            height="3"
            rx="1"
            fill="currentColor"
            opacity="0.06"
          />
          <rect
            x={18 + i * 78}
            y="60"
            width="45"
            height="3"
            rx="1"
            fill="currentColor"
            opacity="0.06"
          />
          <rect
            x={18 + i * 78}
            y="66"
            width="48"
            height="3"
            rx="1"
            fill="currentColor"
            opacity="0.06"
          />
        </g>
      ))}
    </svg>
  ),

  lesson_accordion: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="30"
        y="6"
        width="180"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.14"
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="6"
            y={22 + i * 32}
            width="228"
            height="28"
            rx="4"
            fill="currentColor"
            opacity="0.05"
          />
          <rect
            x="14"
            y={30 + i * 32}
            width="100"
            height="6"
            rx="2"
            fill="currentColor"
            opacity="0.14"
          />
          <rect
            x="14"
            y={40 + i * 32}
            width="60"
            height="4"
            rx="1.5"
            fill="currentColor"
            opacity="0.06"
          />
        </g>
      ))}
    </svg>
  ),

  bonus_gifts: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={10 + i * 78}
            y="15"
            width="68"
            height="80"
            rx="6"
            fill="currentColor"
            opacity="0.06"
          />
          <rect
            x={20 + i * 78}
            y="30"
            width="22"
            height="22"
            rx="4"
            fill="currentColor"
            opacity="0.1"
          />
          <rect
            x={50 + i * 78}
            y="32"
            width="22"
            height="8"
            rx="2"
            fill="currentColor"
            opacity="0.15"
          />
          <rect
            x={50 + i * 78}
            y="44"
            width="24"
            height="6"
            rx="2"
            fill="currentColor"
            opacity="0.1"
          />
          <rect
            x={20 + i * 78}
            y="66"
            width="48"
            height="5"
            rx="2"
            fill="currentColor"
            opacity="0.08"
          />
        </g>
      ))}
    </svg>
  ),

  testimonial_videos: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 1].map((i) => (
        <g key={i}>
          <rect
            x={5 + i * 118}
            y="5"
            width="112"
            height="85"
            rx="6"
            fill="currentColor"
            opacity="0.06"
          />
          <circle
            cx={30 + i * 118}
            cy="30"
            r="12"
            fill="currentColor"
            opacity="0.12"
          />
          <rect
            x={50 + i * 118}
            y="24"
            width="50"
            height="6"
            rx="2"
            fill="currentColor"
            opacity="0.15"
          />
          <rect
            x={50 + i * 118}
            y="34"
            width="30"
            height="5"
            rx="2"
            fill="currentColor"
            opacity="0.08"
          />
          <rect
            x={48 + i * 118}
            y="48"
            width="60"
            height="4"
            rx="1.5"
            fill="currentColor"
            opacity="0.08"
          />
          <rect
            x={48 + i * 118}
            y="56"
            width="55"
            height="4"
            rx="1.5"
            fill="currentColor"
            opacity="0.08"
          />
          <rect
            x={48 + i * 118}
            y="64"
            width="40"
            height="4"
            rx="1.5"
            fill="currentColor"
            opacity="0.08"
          />
        </g>
      ))}
    </svg>
  ),

  featured_students: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 1].map((i) => (
        <g key={i}>
          <rect
            x={5 + i * 118}
            y="5"
            width="112"
            height="55"
            rx="6"
            fill="currentColor"
            opacity="0.06"
          />
          <circle
            cx={25 + i * 118}
            cy="25"
            r="10"
            fill="currentColor"
            opacity="0.12"
          />
          <rect
            x={42 + i * 118}
            y="18"
            width="60"
            height="6"
            rx="2"
            fill="currentColor"
            opacity="0.15"
          />
          <rect
            x={42 + i * 118}
            y="28"
            width="40"
            height="4"
            rx="2"
            fill="currentColor"
            opacity="0.08"
          />
          <rect
            x={10 + i * 118}
            y="48"
            width="105"
            height="4"
            rx="1.5"
            fill="currentColor"
            opacity="0.06"
          />
        </g>
      ))}
      <rect
        x="50"
        y="75"
        width="140"
        height="20"
        rx="4"
        fill="currentColor"
        opacity="0.06"
      />
    </svg>
  ),

  instructor_journey: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="22" fill="currentColor" opacity="0.08" />
      <rect
        x="75"
        y="30"
        width="100"
        height="10"
        rx="3"
        fill="currentColor"
        opacity="0.18"
      />
      <rect
        x="75"
        y="46"
        width="50"
        height="6"
        rx="2"
        fill="currentColor"
        opacity="0.08"
      />
      <rect
        x="20"
        y="76"
        width="200"
        height="5"
        rx="2"
        fill="currentColor"
        opacity="0.07"
      />
      <rect
        x="20"
        y="86"
        width="180"
        height="5"
        rx="2"
        fill="currentColor"
        opacity="0.07"
      />
      <rect
        x="20"
        y="96"
        width="160"
        height="5"
        rx="2"
        fill="currentColor"
        opacity="0.07"
      />
      <rect
        x="140"
        y="104"
        width="40"
        height="5"
        rx="2"
        fill="currentColor"
        opacity="0.05"
      />
    </svg>
  ),

  sales_story: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="10"
        y="6"
        width="140"
        height="10"
        rx="3"
        fill="currentColor"
        opacity="0.18"
      />
      <rect
        x="10"
        y="28"
        width="100"
        height="50"
        rx="4"
        fill="currentColor"
        opacity="0.06"
      />
      <rect
        x="120"
        y="28"
        width="100"
        height="50"
        rx="4"
        fill="currentColor"
        opacity="0.06"
      />
      <rect
        x="10"
        y="90"
        width="200"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.07"
      />
      <rect
        x="10"
        y="98"
        width="180"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.07"
      />
    </svg>
  ),

  rich_text: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="10"
        y="6"
        width="140"
        height="10"
        rx="3"
        fill="currentColor"
        opacity="0.18"
      />
      <rect
        x="10"
        y="22"
        width="200"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.08"
      />
      <rect
        x="10"
        y="32"
        width="190"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.08"
      />
      <rect
        x="10"
        y="42"
        width="160"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.08"
      />
      <rect
        x="10"
        y="52"
        width="120"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.05"
      />
      <rect
        x="10"
        y="66"
        width="100"
        height="6"
        rx="3"
        fill="currentColor"
        opacity="0.14"
      />
      <rect
        x="10"
        y="78"
        width="210"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.07"
      />
      <rect
        x="10"
        y="88"
        width="180"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.07"
      />
      <rect
        x="10"
        y="98"
        width="200"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.07"
      />
      <rect
        x="10"
        y="108"
        width="100"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.05"
      />
    </svg>
  ),

  pricing_card: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="20"
        y="4"
        width="200"
        height="112"
        rx="8"
        fill="currentColor"
        opacity="0.04"
      />
      <rect
        x="60"
        y="14"
        width="120"
        height="24"
        rx="4"
        fill="currentColor"
        opacity="0.08"
      />
      <rect
        x="80"
        y="48"
        width="80"
        height="18"
        rx="4"
        fill="currentColor"
        opacity="0.16"
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="40"
            y={74 + i * 12}
            width="6"
            height="6"
            rx="3"
            fill="currentColor"
            opacity="0.1"
          />
          <rect
            x="54"
            y={76 + i * 12}
            width="120"
            height="4"
            rx="1.5"
            fill="currentColor"
            opacity="0.08"
          />
        </g>
      ))}
      <rect
        x="80"
        y="108"
        width="80"
        height="16"
        rx="8"
        fill="currentColor"
        opacity="0.14"
      />
    </svg>
  ),

  faq_accordion: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="60"
        y="4"
        width="120"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.14"
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="6"
            y={22 + i * 32}
            width="228"
            height="28"
            rx="4"
            fill="currentColor"
            opacity="0.05"
          />
          <rect
            x="14"
            y={30 + i * 32}
            width="140"
            height="6"
            rx="2"
            fill="currentColor"
            opacity="0.14"
          />
          <line
            x1="212"
            y1={33 + i * 32}
            x2="222"
            y2={33 + i * 32}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  ),
};

export function SectionSkeletonPreview({ type }: PreviewProps) {
  const Preview = SKELETON_PREVIEWS[type];
  if (!Preview) return null;
  return (
    <div
      className="section-skeleton-preview"
      style={{ width: 240, height: 120, color: "var(--admin-text-secondary)" }}
    >
      <Preview />
    </div>
  );
}
