import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useHeroAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const videoRef = useRef<HTMLDivElement>(null!);

  useGSAP(
    () => {
      const root = sectionRef.current;
      const video = videoRef.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(video, {
          y: "18%",
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.9 },
        });
        tl.from(root.querySelector("[data-hero-overlay]"), {
          opacity: 0,
          duration: 1.4,
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.querySelectorAll("[data-hero-btn]"), {
          opacity: 1,
          y: 0,
          clearProps: "all",
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return { sectionRef, videoRef };
}
