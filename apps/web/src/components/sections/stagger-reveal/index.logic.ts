import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useStaggerReveal(staggerAmount: number = 0.08) {
  const ref = useRef<HTMLDivElement>(null!);

  useGSAP(
    () => {
      const root = ref.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = root.querySelectorAll("[data-reveal]");
        if (items.length === 0) return;

        gsap.fromTo(
          items,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: staggerAmount,
            ease: "power3.out",
            scrollTrigger: {
              trigger: root,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.querySelectorAll("[data-reveal]"), {
          opacity: 1,
          y: 0,
          scale: 1,
          clearProps: "all",
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return { ref };
}
