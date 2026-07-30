import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useStickyCTA() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      gsap.set(ref.current, { y: 40, opacity: 0 });

      gsap.to(ref.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: document.body,
          start: "bottom 105%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: ref },
  );

  return { ref };
}
