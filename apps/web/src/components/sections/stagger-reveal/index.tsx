"use client";

import type { ReactNode } from "react";
import { useStaggerReveal } from "./index.logic";

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerAmount?: number;
}

export function StaggerReveal({
  children,
  className = "",
  staggerAmount = 0.08,
}: StaggerRevealProps) {
  const { ref } = useStaggerReveal(staggerAmount);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
