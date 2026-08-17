import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import type { MotionConcept } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export function useMotionReveal(concept: MotionConcept) {
  const ref = useRef<HTMLDivElement>(null!);

  useGSAP(
    () => {
      const root = ref.current;
      const mm = gsap.matchMedia();
      const items = root.querySelectorAll("[data-motion-item]");

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        switch (concept) {
          case "fade":
            gsap.fromTo(
              items,
              { opacity: 0, y: 24 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: root,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              },
            );
            break;

          case "slide":
            gsap.fromTo(
              items,
              { opacity: 0, x: (i: number) => (i % 2 === 0 ? -60 : 60) },
              {
                opacity: 1,
                x: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: root,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              },
            );
            break;

          case "parallax":
            gsap.utils.toArray<HTMLElement>(items).forEach((el, i) => {
              gsap.fromTo(
                el,
                { opacity: 0, y: 60 + (i % 3) * 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.9,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    toggleActions: "play none none none",
                  },
                },
              );
              gsap.to(el, {
                yPercent: (i % 2 === 0 ? 6 : -6) as number,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              });
            });
            break;

          case "zoom":
            gsap.fromTo(
              items,
              { opacity: 0, scale: 0.9 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.09,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: root,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              },
            );
            break;

          case "clip":
            gsap.fromTo(
              items,
              { opacity: 0, clipPath: "inset(12% 12% 12% 12%)" },
              {
                opacity: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: root,
                  start: "top 82%",
                  toggleActions: "play none none none",
                },
              },
            );
            break;

          case "cascade":
            gsap.fromTo(
              items,
              { opacity: 0, y: 40 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: root,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              },
            );
            break;
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(items, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          clearProps: "all",
        });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [concept] },
  );

  return { ref };
}
