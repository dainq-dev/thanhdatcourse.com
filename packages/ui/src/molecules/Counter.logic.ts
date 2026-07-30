import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useCounterAnimation(value: number, duration: number = 2.5) {
  const ref = useRef<HTMLDivElement>(null!);
  const numberRef = useRef<HTMLSpanElement>(null!);

  useGSAP(
    () => {
      const numEl = numberRef.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: value,
          duration,
          ease: "power2.out",
          snap: { val: 1 },
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            numEl.textContent = formatNumber(Math.round(obj.val));
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        numEl.textContent = formatNumber(value);
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return { ref, numberRef };
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}
