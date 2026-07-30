"use client";

import type { ReactNode } from "react";
import { useAnimatedSection } from "./index.logic";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) {
  const { ref } = useAnimatedSection(delay);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
