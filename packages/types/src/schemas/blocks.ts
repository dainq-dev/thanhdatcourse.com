import { z } from "zod";

const BaseBlock = z.object({
  id: z.string().uuid(),
  type: z.string(),
});

// ─── Typography Blocks ─────────────────────────────

export const HeadingBlock = BaseBlock.extend({
  type: z.literal("heading"),
  data: z.object({
    level: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    text: z.string().min(1),
    alignment: z.enum(["left", "center", "right"]).default("left"),
  }),
});

export const ParagraphBlock = BaseBlock.extend({
  type: z.literal("paragraph"),
  data: z.object({
    text: z.string().min(1),
    alignment: z.enum(["left", "center", "right"]).default("left"),
    dropCap: z.boolean().default(false),
  }),
});

export const QuoteBlock = BaseBlock.extend({
  type: z.literal("quote"),
  data: z.object({
    text: z.string(),
    author: z.string().optional(),
    style: z.enum(["default", "bordered", "pull"]).default("default"),
  }),
});

export const ListBlock = BaseBlock.extend({
  type: z.literal("list"),
  data: z.object({
    style: z.enum(["unordered", "ordered", "checklist"]),
    items: z.array(z.string()),
  }),
});

export const CodeBlock = BaseBlock.extend({
  type: z.literal("code"),
  data: z.object({
    code: z.string(),
    language: z.string().default("plaintext"),
    showLineNumbers: z.boolean().default(false),
  }),
});

export const CalloutBlock = BaseBlock.extend({
  type: z.literal("callout"),
  data: z.object({
    text: z.string(),
    variant: z.enum(["info", "warning", "tip", "danger"]).default("info"),
    icon: z.string().optional(),
  }),
});

// ─── Media Blocks ──────────────────────────────────

export const ImageBlock = BaseBlock.extend({
  type: z.literal("image"),
  data: z.object({
    mediaId: z.string().uuid(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.enum(["full", "wide", "contained", "inline"]).default("wide"),
    border: z.boolean().default(false),
    rounded: z.boolean().default(false),
  }),
});

export const VideoBlock = BaseBlock.extend({
  type: z.literal("video"),
  data: z.object({
    mediaId: z.string(),
    caption: z.string().optional(),
    aspectRatio: z.enum(["16:9", "4:3", "9:16", "1:1"]).default("16:9"),
  }),
});

export const GalleryBlock = BaseBlock.extend({
  type: z.literal("gallery"),
  data: z.object({
    images: z.array(
      z.object({
        mediaId: z.string(),
        caption: z.string().optional(),
      }),
    ),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
    gap: z.enum(["sm", "md", "lg"]).default("md"),
    layout: z.enum(["grid", "masonry"]).default("grid"),
  }),
});

export const CarouselBlock = BaseBlock.extend({
  type: z.literal("carousel"),
  data: z.object({
    slides: z.array(
      z.object({
        mediaId: z.string(),
        caption: z.string().optional(),
      }),
    ),
    autoplay: z.boolean().default(false),
    interval: z.number().min(1000).default(5000),
    showDots: z.boolean().default(true),
    showArrows: z.boolean().default(true),
  }),
});

export const BeforeAfterBlock = BaseBlock.extend({
  type: z.literal("beforeAfter"),
  data: z.object({
    beforeMediaId: z.string(),
    afterMediaId: z.string(),
    beforeLabel: z.string().default("Before"),
    afterLabel: z.string().default("After"),
    caption: z.string().optional(),
  }),
});

// ─── Layout Blocks ─────────────────────────────────

export const DividerBlock = BaseBlock.extend({
  type: z.literal("divider"),
  data: z.object({
    style: z.enum(["solid", "dashed", "dotted", "gradient"]).default("solid"),
  }),
});

export const SpacerBlock = BaseBlock.extend({
  type: z.literal("spacer"),
  data: z.object({
    height: z.number().min(8).max(200).default(40),
  }),
});

// ─── Recursive schemas ─────────────────────────────
// zod.lazy() enables recursion at runtime; TypeScript types
// are patched up below with the Block discriminated union.

let _BlockSchema: z.ZodType;

export const ColumnsBlock = BaseBlock.extend({
  type: z.literal("columns"),
  data: z.object({
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    content: z.array(z.array(z.lazy(() => _BlockSchema))),
    gap: z.enum(["sm", "md", "lg"]).default("md"),
  }),
});

export const TabsBlock = BaseBlock.extend({
  type: z.literal("tabs"),
  data: z.object({
    tabs: z.array(
      z.object({
        label: z.string(),
        content: z.array(z.lazy(() => _BlockSchema)),
      }),
    ),
  }),
});

// ─── Interactive Blocks ────────────────────────────

export const AccordionBlock = BaseBlock.extend({
  type: z.literal("accordion"),
  data: z.object({
    items: z.array(
      z.object({
        title: z.string(),
        content: z.array(z.lazy(() => _BlockSchema)),
      }),
    ),
    allowMultiple: z.boolean().default(true),
  }),
});

export const CollapseBlock = BaseBlock.extend({
  type: z.literal("collapse"),
  data: z.object({
    title: z.string(),
    content: z.array(z.lazy(() => _BlockSchema)),
    defaultOpen: z.boolean().default(false),
  }),
});

export const TimelineBlock = BaseBlock.extend({
  type: z.literal("timeline"),
  data: z.object({
    events: z.array(
      z.object({
        date: z.string(),
        title: z.string(),
        description: z.string(),
      }),
    ),
  }),
});

export const TableBlock = BaseBlock.extend({
  type: z.literal("table"),
  data: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    striped: z.boolean().default(true),
    compact: z.boolean().default(false),
  }),
});

// ─── Conversion Blocks ─────────────────────────────

export const CTABlock = BaseBlock.extend({
  type: z.literal("cta"),
  data: z.object({
    heading: z.string(),
    text: z.string().optional(),
    buttonText: z.string(),
    buttonUrl: z.string(),
    style: z.enum(["primary", "secondary", "minimal"]).default("primary"),
    backgroundMediaId: z.string().optional(),
  }),
});

export const PricingTableBlock = BaseBlock.extend({
  type: z.literal("pricingTable"),
  data: z.object({
    plans: z.array(
      z.object({
        name: z.string(),
        price: z.string(),
        period: z.string().optional(),
        description: z.string().optional(),
        features: z.array(z.string()),
        cta: z.object({ text: z.string(), url: z.string() }),
        highlighted: z.boolean().default(false),
      }),
    ),
  }),
});

export const TestimonialBlock = BaseBlock.extend({
  type: z.literal("testimonial"),
  data: z.object({
    testimonialId: z.string(),
    style: z.enum(["card", "inline", "large"]).default("card"),
  }),
});

// ─── Block discriminated union ─────────────────────

export type Block =
  | {
      id: string;
      type: "heading";
      data: {
        level: 1 | 2 | 3 | 4 | 5 | 6;
        text: string;
        alignment: "left" | "center" | "right";
      };
    }
  | {
      id: string;
      type: "paragraph";
      data: {
        text: string;
        alignment: "left" | "center" | "right";
        dropCap: boolean;
      };
    }
  | {
      id: string;
      type: "quote";
      data: {
        text: string;
        author?: string;
        style: "default" | "bordered" | "pull";
      };
    }
  | {
      id: string;
      type: "list";
      data: { style: "unordered" | "ordered" | "checklist"; items: string[] };
    }
  | {
      id: string;
      type: "code";
      data: { code: string; language: string; showLineNumbers: boolean };
    }
  | {
      id: string;
      type: "callout";
      data: {
        text: string;
        variant: "info" | "warning" | "tip" | "danger";
        icon?: string;
      };
    }
  | {
      id: string;
      type: "image";
      data: {
        mediaId: string;
        alt?: string;
        caption?: string;
        width: "full" | "wide" | "contained" | "inline";
        border: boolean;
        rounded: boolean;
      };
    }
  | {
      id: string;
      type: "video";
      data: {
        mediaId: string;
        caption?: string;
        aspectRatio: "16:9" | "4:3" | "9:16" | "1:1";
      };
    }
  | {
      id: string;
      type: "gallery";
      data: {
        images: { mediaId: string; caption?: string }[];
        columns: 2 | 3 | 4;
        gap: "sm" | "md" | "lg";
        layout: "grid" | "masonry";
      };
    }
  | {
      id: string;
      type: "carousel";
      data: {
        slides: { mediaId: string; caption?: string }[];
        autoplay: boolean;
        interval: number;
        showDots: boolean;
        showArrows: boolean;
      };
    }
  | {
      id: string;
      type: "beforeAfter";
      data: {
        beforeMediaId: string;
        afterMediaId: string;
        beforeLabel: string;
        afterLabel: string;
        caption?: string;
      };
    }
  | {
      id: string;
      type: "divider";
      data: { style: "solid" | "dashed" | "dotted" | "gradient" };
    }
  | {
      id: string;
      type: "spacer";
      data: { height: number };
    }
  | {
      id: string;
      type: "columns";
      data: { columns: 2 | 3 | 4; content: Content[]; gap: "sm" | "md" | "lg" };
    }
  | {
      id: string;
      type: "tabs";
      data: { tabs: { label: string; content: Content }[] };
    }
  | {
      id: string;
      type: "accordion";
      data: {
        items: { title: string; content: Content }[];
        allowMultiple: boolean;
      };
    }
  | {
      id: string;
      type: "collapse";
      data: { title: string; content: Content; defaultOpen: boolean };
    }
  | {
      id: string;
      type: "timeline";
      data: { events: { date: string; title: string; description: string }[] };
    }
  | {
      id: string;
      type: "table";
      data: {
        headers: string[];
        rows: string[][];
        striped: boolean;
        compact: boolean;
      };
    }
  | {
      id: string;
      type: "cta";
      data: {
        heading: string;
        text?: string;
        buttonText: string;
        buttonUrl: string;
        style: "primary" | "secondary" | "minimal";
        backgroundMediaId?: string;
      };
    }
  | {
      id: string;
      type: "pricingTable";
      data: {
        plans: {
          name: string;
          price: string;
          period?: string;
          description?: string;
          features: string[];
          cta: { text: string; url: string };
          highlighted: boolean;
        }[];
      };
    }
  | {
      id: string;
      type: "testimonial";
      data: { testimonialId: string; style: "card" | "inline" | "large" };
    };

export const BlockSchema: z.ZodType<Block> = z.discriminatedUnion("type", [
  HeadingBlock as any,
  ParagraphBlock as any,
  QuoteBlock as any,
  ListBlock as any,
  CodeBlock as any,
  CalloutBlock as any,
  ImageBlock as any,
  VideoBlock as any,
  GalleryBlock as any,
  CarouselBlock as any,
  BeforeAfterBlock as any,
  DividerBlock as any,
  SpacerBlock as any,
  ColumnsBlock as any,
  TabsBlock as any,
  AccordionBlock as any,
  CollapseBlock as any,
  TimelineBlock as any,
  TableBlock as any,
  CTABlock as any,
  PricingTableBlock as any,
  TestimonialBlock as any,
]);

_BlockSchema = BlockSchema;

export const ContentSchema = z.array(BlockSchema);
export type Content = Block[];

export type BlockData<T extends Block["type"]> = Extract<
  Block,
  { type: T }
>["data"];
