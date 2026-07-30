import type { Block, Content } from "@workspace/types";
import { useCallback, useRef, useState } from "react";

function getDefaultData(type: Block["type"]): Block["data"] {
  switch (type) {
    case "heading":
      return { level: 2, text: "", alignment: "left" };
    case "paragraph":
      return { text: "", alignment: "left", dropCap: false };
    case "quote":
      return { text: "", style: "default" };
    case "list":
      return { style: "unordered", items: [""] };
    case "code":
      return { code: "", language: "plaintext", showLineNumbers: false };
    case "callout":
      return { text: "", variant: "info" };
    case "image":
      return { mediaId: "", width: "wide", border: false, rounded: false };
    case "video":
      return { mediaId: "", aspectRatio: "16:9" };
    case "gallery":
      return { images: [], columns: 3, gap: "md", layout: "grid" };
    case "carousel":
      return {
        slides: [],
        autoplay: false,
        interval: 5000,
        showDots: true,
        showArrows: true,
      };
    case "beforeAfter":
      return {
        beforeMediaId: "",
        afterMediaId: "",
        beforeLabel: "Before",
        afterLabel: "After",
      };
    case "divider":
      return { style: "solid" };
    case "spacer":
      return { height: 40 };
    case "columns":
      return { columns: 2, content: [[], []], gap: "md" };
    case "tabs":
      return { tabs: [{ label: "Tab 1", content: [] }] };
    case "accordion":
      return { items: [{ title: "", content: [] }], allowMultiple: true };
    case "collapse":
      return { title: "", content: [], defaultOpen: false };
    case "timeline":
      return { events: [{ date: "", title: "", description: "" }] };
    case "table":
      return {
        headers: ["Cột 1", "Cột 2"],
        rows: [["", ""]],
        striped: true,
        compact: false,
      };
    case "cta":
      return { heading: "", buttonText: "", buttonUrl: "", style: "primary" };
    case "pricingTable":
      return { plans: [] };
    case "testimonial":
      return { testimonialId: "", style: "card" };
    default:
      return {} as Block["data"];
  }
}

const MAX_HISTORY = 50;

export interface BlockEditorState {
  blocks: Content;
  addBlock: (type: Block["type"], index?: number) => void;
  updateBlock: (id: string, data: Record<string, unknown>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  setBlocks: (blocks: Content) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useBlockEditor(initialBlocks: Content = []): BlockEditorState {
  const [blocks, setBlocksState] = useState<Content>(initialBlocks);
  const historyRef = useRef<Content[]>([initialBlocks]);
  const pointerRef = useRef(0);

  const pushHistory = useCallback((next: Content) => {
    historyRef.current = [
      ...historyRef.current.slice(0, pointerRef.current + 1),
      next,
    ].slice(-MAX_HISTORY);
    pointerRef.current = Math.min(
      historyRef.current.length - 1,
      MAX_HISTORY - 1,
    );
  }, []);

  const addBlock = useCallback(
    (type: Block["type"], index?: number) => {
      setBlocksState((prev) => {
        const block: Block = {
          id: crypto.randomUUID(),
          type,
          data: getDefaultData(type),
        } as Block;
        const next = [...prev];
        if (index !== undefined && index <= next.length) {
          next.splice(index, 0, block);
        } else {
          next.push(block);
        }
        pushHistory(next);
        return next;
      });
    },
    [pushHistory],
  );

  const updateBlock = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setBlocksState((prev) => {
        const next = prev.map((b) =>
          b.id === id ? ({ ...b, data } as Block) : b,
        );
        pushHistory(next);
        return next;
      });
    },
    [pushHistory],
  );

  const removeBlock = useCallback(
    (id: string) => {
      setBlocksState((prev) => {
        const next = prev.filter((b) => b.id !== id);
        pushHistory(next);
        return next;
      });
    },
    [pushHistory],
  );

  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      setBlocksState((prev) => {
        const next = [...prev];
        const [removed] = next.splice(fromIndex, 1);
        if (removed) {
          next.splice(toIndex, 0, removed);
        }
        pushHistory(next);
        return next;
      });
    },
    [pushHistory],
  );

  const setBlocks = useCallback(
    (blocks: Content) => {
      setBlocksState(blocks);
      pushHistory(blocks);
    },
    [pushHistory],
  );

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      pointerRef.current -= 1;
      setBlocksState(historyRef.current[pointerRef.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      pointerRef.current += 1;
      setBlocksState(historyRef.current[pointerRef.current]);
    }
  }, []);

  return {
    blocks,
    addBlock,
    updateBlock,
    removeBlock,
    reorderBlocks,
    setBlocks,
    undo,
    redo,
    canUndo: pointerRef.current > 0,
    canRedo: pointerRef.current < historyRef.current.length - 1,
  };
}
