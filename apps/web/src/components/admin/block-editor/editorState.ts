import { useCallback, useRef } from "react";
import type { Block, Content } from "@workspace/types";

export function getDefaultData(type: Block["type"]): Record<string, unknown> {
  switch (type) {
    // ── Typography ──
    case "heading":
      return { level: 2, text: "", alignment: "left", weight: "bold", italic: false, underline: false, color: "inherit" };
    case "paragraph":
      return { text: "", alignment: "left", dropCap: false, fontSize: "md", lineHeight: "normal", weight: "regular", color: "inherit" };
    case "quote":
      return { text: "", style: "default", icon: null };
    case "list":
      return { style: "unordered", items: [""] };
    case "code":
      return { code: "", language: "plaintext", showLineNumbers: false, theme: "dark", showCopyButton: true };
    case "callout":
      return { text: "", variant: "info", icon: null, title: "" };
    // ── Media ──
    case "image":
      return { mediaId: "", width: "wide", rounded: "none", border: "none", shadow: "none", hoverZoom: false, link: "", objectFit: "cover" };
    case "video":
      return { mediaId: "", aspectRatio: "16:9", rounded: "none", shadow: "none", autoplay: false, loop: false, showControls: true, thumbnail: "" };
    case "gallery":
      return { images: [], columns: 3, gap: "md", layout: "grid", rounded: "none", shadow: "none", hoverZoom: false, lightbox: true };
    case "carousel":
      return { slides: [], autoplay: false, interval: 5000, showDots: true, showArrows: true, transition: "slide", rounded: "none", shadow: "none", aspectRatio: "16:9", loop: true, pauseOnHover: true, slidesPerView: 1 };
    case "beforeAfter":
      return { beforeMediaId: "", afterMediaId: "", beforeLabel: "Trước", afterLabel: "Sau", orientation: "horizontal", rounded: "none", shadow: "none" };
    // ── Layout ──
    case "divider":
      return { style: "solid" };
    case "spacer":
      return { height: 40 };
    case "columns":
      return { columns: 2, content: [[], []], gap: "md", columnRatios: "auto" };
    case "tabs":
      return { tabs: [{ label: "Tab 1", content: [] }], tabStyle: "top", defaultTab: 0 };
    // ── Interactive ──
    case "accordion":
      return { items: [{ title: "", content: [] }], allowMultiple: true, iconPosition: "right", defaultOpenIndex: -1, borderStyle: "bordered" };
    case "collapse":
      return { title: "", content: [], defaultOpen: false, iconPosition: "right" };
    case "timeline":
      return { events: [{ date: "", title: "", description: "" }], layout: "vertical", iconPerEvent: null, lineColor: "--color-border" };
    case "table":
      return { headers: ["Cột 1", "Cột 2"], rows: [["", ""]], striped: true, compact: false };
    // ── Conversion ──
    case "cta":
      return { heading: "", buttonText: "", buttonUrl: "", style: "primary", buttonStyle: "solid", buttonSize: "md", buttonIcon: null };
    case "pricingTable":
      return { plans: [], currency: "VNĐ", billingPeriod: "monthly", layout: "horizontal" };
    case "testimonial":
      return { testimonialId: "", style: "card", showAvatar: true, showRating: true, avatarSize: "md", background: "none" };
    default:
      return {};
  }
}

const MAX_HISTORY = 50;

export function useBlockEditorState(blocks: Content, onChange: (blocks: Content) => void) {
  const historyRef = useRef<Content[]>([]);
  const pointerRef = useRef(-1);

  const pushHistory = useCallback((next: Content) => {
    historyRef.current = [
      ...historyRef.current.slice(0, pointerRef.current + 1),
      next,
    ].slice(-MAX_HISTORY);
    pointerRef.current = historyRef.current.length - 1;
  }, []);

  const addBlock = useCallback((type: Block["type"], atIndex?: number) => {
    const block: Block = { id: crypto.randomUUID(), type, data: getDefaultData(type) } as Block;
    const next = [...blocks];
    if (atIndex !== undefined && atIndex <= next.length) next.splice(atIndex, 0, block);
    else next.push(block);
    pushHistory(next);
    onChange(next);
  }, [blocks, onChange, pushHistory]);

  const updateBlock = useCallback((id: string, data: Record<string, unknown>) => {
    const next = blocks.map((b) => (b.id === id ? ({ ...b, data } as Block) : b));
    pushHistory(next);
    onChange(next);
  }, [blocks, onChange, pushHistory]);

  const removeBlock = useCallback((id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    pushHistory(next);
    onChange(next);
  }, [blocks, onChange, pushHistory]);

  const reorderBlocks = useCallback((from: number, to: number) => {
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    if (item) next.splice(to, 0, item);
    pushHistory(next);
    onChange(next);
  }, [blocks, onChange, pushHistory]);

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      pointerRef.current -= 1;
      onChange(historyRef.current[pointerRef.current]);
    }
  }, [onChange]);

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      pointerRef.current += 1;
      onChange(historyRef.current[pointerRef.current]);
    }
  }, [onChange]);

  return {
    addBlock, updateBlock, removeBlock, reorderBlocks, undo, redo,
    canUndo: pointerRef.current > 0,
    canRedo: pointerRef.current < historyRef.current.length - 1,
  };
}
