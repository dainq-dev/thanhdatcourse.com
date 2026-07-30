import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useAnimatedSection(delay: number = 0) {
  const ref = useRef<HTMLDivElement>(null!);

  useGSAP(
    () => {
      const root = ref.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = root.querySelectorAll(".reveal-item");
        gsap.fromTo(
          items,
          { opacity: 0, y: 50, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.12,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: root,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.querySelectorAll(".reveal-item"), {
          opacity: 1,
          y: 0,
          filter: "none",
          clearProps: "all",
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return { ref };
}
