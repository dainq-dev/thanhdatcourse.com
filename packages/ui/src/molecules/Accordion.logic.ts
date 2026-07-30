import { useCallback, useEffect, useRef, useState } from "react";

export function useAccordion(defaultOpen: boolean = false) {
  const [open, setOpen] = useState(defaultOpen);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.style.maxHeight = open
        ? `${panelRef.current.scrollHeight}px`
        : "0px";
    }
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return { open, panelRef, toggle };
}
