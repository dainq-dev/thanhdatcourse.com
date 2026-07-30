import { useCallback, useRef } from "react";
import type { Block, Content } from "@workspace/types";

function getDefaultData(type: Block["type"]): Record<string, unknown> {
  switch (type) {
    case "heading": return { level: 2, text: "", alignment: "left" };
    case "paragraph": return { text: "", alignment: "left", dropCap: false };
    case "quote": return { text: "", style: "default" };
    case "list": return { style: "unordered", items: [""] };
    case "code": return { code: "", language: "plaintext", showLineNumbers: false };
    case "callout": return { text: "", variant: "info" };
    case "image": return { mediaId: "", width: "wide", border: false, rounded: false };
    case "video": return { mediaId: "", aspectRatio: "16:9" };
    case "gallery": return { images: [], columns: 3, gap: "md", layout: "grid" };
    case "carousel": return { slides: [], autoplay: false, interval: 5000, showDots: true, showArrows: true };
    case "beforeAfter": return { beforeMediaId: "", afterMediaId: "", beforeLabel: "Before", afterLabel: "After" };
    case "divider": return { style: "solid" };
    case "spacer": return { height: 40 };
    case "columns": return { columns: 2, content: [[], []], gap: "md" };
    case "tabs": return { tabs: [{ label: "Tab 1", content: [] }] };
    case "accordion": return { items: [{ title: "", content: [] }], allowMultiple: true };
    case "collapse": return { title: "", content: [], defaultOpen: false };
    case "timeline": return { events: [{ date: "", title: "", description: "" }] };
    case "table": return { headers: ["Cột 1", "Cột 2"], rows: [["", ""]], striped: true, compact: false };
    case "cta": return { heading: "", buttonText: "", buttonUrl: "", style: "primary" };
    case "pricingTable": return { plans: [] };
    case "testimonial": return { testimonialId: "", style: "card" };
    default: return {};
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
