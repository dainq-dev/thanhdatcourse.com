"use client";

import type { ReactNode } from "react";
import type { MotionConcept } from "@/lib/motion";
import { useMotionReveal } from "./index.logic";

interface MotionRevealProps {
  concept: MotionConcept;
  children: ReactNode;
  className?: string;
}

export function MotionReveal({
  concept,
  children,
  className = "",
}: MotionRevealProps) {
  const { ref } = useMotionReveal(concept);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
