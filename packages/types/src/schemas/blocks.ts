import { z } from "zod";

// ─── Shared Schemas ───────────────────────────────

const roundedSchema = z.preprocess(
  (val) => {
    if (typeof val === "boolean") return val ? "md" : "none";
    return val;
  },
  z.enum(["none", "sm", "md", "lg", "full"]).default("none"),
);

const shadowSchema = z.enum(["none", "sm", "md", "lg", "xl"]).default("none");
const iconSchema = z.string().nullable().default(null);
const fontWeightSchema = z.enum(["regular", "medium", "semibold", "bold"]).default("regular");
const fontSizeSchema = z.enum(["sm", "md", "lg"]).default("md");
const lineHeightSchema = z.enum(["tight", "normal", "relaxed"]).default("normal");
const alignmentSchema = z.enum(["left", "center", "right", "justify"]).default("left");
const colorSchema = z.enum([
  "inherit",
  "--color-text",
  "--color-text-muted",
  "--color-primary",
  "--color-accent",
  "--color-border",
]).default("inherit");
const cssVarColorSchema = z.enum(["--color-border", "--color-primary", "--color-accent"]).default("--color-border");
const borderSchema = z.preprocess(
  (val) => {
    if (typeof val === "boolean") return val ? "medium" : "none";
    return val;
  },
  z.enum(["none", "thin", "medium", "thick"]).default("none"),
);

const BaseBlock = z.object({
  id: z.string().uuid(),
  type: z.string(),
});

// ─── Typography Blocks ─────────────────────────────

export const HeadingBlock = BaseBlock.extend({
  type: z.literal("heading"),
  data: z.object({
    level: z.union([
      z.literal(1), z.literal(2), z.literal(3),
      z.literal(4), z.literal(5), z.literal(6),
    ]),
    text: z.string().min(1),
    alignment: alignmentSchema,
    weight: fontWeightSchema,
    italic: z.boolean().default(false),
    underline: z.boolean().default(false),
    color: colorSchema,
  }),
});

export const ParagraphBlock = BaseBlock.extend({
  type: z.literal("paragraph"),
  data: z.object({
    text: z.string().min(1),
    alignment: alignmentSchema,
    dropCap: z.boolean().default(false),
    fontSize: fontSizeSchema,
    lineHeight: lineHeightSchema,
    weight: fontWeightSchema,
    color: colorSchema,
  }),
});

export const QuoteBlock = BaseBlock.extend({
  type: z.literal("quote"),
  data: z.object({
    text: z.string(),
    author: z.string().optional(),
    style: z.enum(["default", "bordered", "pull"]).default("default"),
    icon: iconSchema,
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
    theme: z.enum(["dark", "light"]).default("dark"),
    showCopyButton: z.boolean().default(true),
  }),
});

export const CalloutBlock = BaseBlock.extend({
  type: z.literal("callout"),
  data: z.object({
    text: z.string(),
    variant: z.enum(["info", "warning", "tip", "danger"]).default("info"),
    icon: iconSchema,
    title: z.string().optional().default(""),
  }),
});

// ─── Media Blocks ──────────────────────────────────

export const ImageBlock = BaseBlock.extend({
  type: z.literal("image"),
  data: z.object({
    mediaId: z.string().uuid(),
    alt: z.string().optional().default(""),
    caption: z.string().optional().default(""),
    width: z.enum(["full", "wide", "contained", "inline"]).default("wide"),
    rounded: roundedSchema,
    border: borderSchema,
    shadow: shadowSchema,
    hoverZoom: z.boolean().default(false),
    link: z.string().optional().default(""),
    objectFit: z.enum(["cover", "contain", "fill"]).default("cover"),
  }),
});

export const VideoBlock = BaseBlock.extend({
  type: z.literal("video"),
  data: z.object({
    mediaId: z.string(),
    caption: z.string().optional().default(""),
    aspectRatio: z.enum(["16:9", "4:3", "9:16", "1:1"]).default("16:9"),
    rounded: roundedSchema,
    shadow: shadowSchema,
    autoplay: z.boolean().default(false),
    loop: z.boolean().default(false),
    showControls: z.boolean().default(true),
    thumbnail: z.string().optional().default(""),
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
    rounded: roundedSchema,
    shadow: shadowSchema,
    hoverZoom: z.boolean().default(false),
    lightbox: z.boolean().default(true),
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
    transition: z.enum(["slide", "fade", "cube"]).default("slide"),
    rounded: roundedSchema,
    shadow: shadowSchema,
    aspectRatio: z.enum(["16:9", "4:3", "1:1", "auto"]).default("16:9"),
    loop: z.boolean().default(true),
    pauseOnHover: z.boolean().default(true),
    slidesPerView: z.number().min(1).max(3).default(1),
  }),
});

export const BeforeAfterBlock = BaseBlock.extend({
  type: z.literal("beforeAfter"),
  data: z.object({
    beforeMediaId: z.string(),
    afterMediaId: z.string(),
    beforeLabel: z.string().default("Trước"),
    afterLabel: z.string().default("Sau"),
    caption: z.string().optional().default(""),
    orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
    rounded: roundedSchema,
    shadow: shadowSchema,
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
let _BlockSchema: z.ZodType;

export const ColumnsBlock = BaseBlock.extend({
  type: z.literal("columns"),
  data: z.object({
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    content: z.array(z.array(z.lazy(() => _BlockSchema))),
    gap: z.enum(["sm", "md", "lg"]).default("md"),
    columnRatios: z.enum([
      "auto", "50-50", "33-33-33", "25-75", "75-25", "33-67", "67-33",
    ]).default("auto"),
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
    tabStyle: z.enum(["top", "pills", "vertical"]).default("top"),
    defaultTab: z.number().min(0).default(0),
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
    iconPosition: z.enum(["left", "right"]).default("right"),
    defaultOpenIndex: z.number().min(-1).default(-1),
    borderStyle: z.enum(["bordered", "borderless"]).default("bordered"),
  }),
});

export const CollapseBlock = BaseBlock.extend({
  type: z.literal("collapse"),
  data: z.object({
    title: z.string(),
    content: z.array(z.lazy(() => _BlockSchema)),
    defaultOpen: z.boolean().default(false),
    iconPosition: z.enum(["left", "right"]).default("right"),
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
    layout: z.enum(["vertical", "horizontal", "alternating"]).default("vertical"),
    iconPerEvent: iconSchema,
    lineColor: cssVarColorSchema,
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
    text: z.string().optional().default(""),
    buttonText: z.string(),
    buttonUrl: z.string(),
    style: z.enum(["primary", "secondary", "minimal"]).default("primary"),
    backgroundMediaId: z.string().optional().default(""),
    buttonStyle: z.enum(["solid", "outline", "ghost"]).default("solid"),
    buttonSize: z.enum(["sm", "md", "lg"]).default("md"),
    buttonIcon: iconSchema,
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
        description: z.string().optional().default(""),
        features: z.array(z.string()),
        cta: z.object({ text: z.string(), url: z.string() }),
        highlighted: z.boolean().default(false),
      }),
    ),
    currency: z.string().default("VNĐ"),
    billingPeriod: z.enum(["monthly", "yearly"]).default("monthly"),
    layout: z.enum(["horizontal", "vertical"]).default("horizontal"),
  }),
});

export const TestimonialBlock = BaseBlock.extend({
  type: z.literal("testimonial"),
  data: z.object({
    testimonialId: z.string(),
    style: z.enum(["card", "inline", "large"]).default("card"),
    showAvatar: z.boolean().default(true),
    showRating: z.boolean().default(true),
    avatarSize: z.enum(["sm", "md", "lg"]).default("md"),
    background: z.enum(["none", "light", "dark", "gradient"]).default("none"),
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
        alignment: "left" | "center" | "right" | "justify";
        weight: "regular" | "medium" | "semibold" | "bold";
        italic: boolean;
        underline: boolean;
        color: "inherit" | "--color-text" | "--color-text-muted" | "--color-primary" | "--color-accent" | "--color-border";
      };
    }
  | {
      id: string;
      type: "paragraph";
      data: {
        text: string;
        alignment: "left" | "center" | "right" | "justify";
        dropCap: boolean;
        fontSize: "sm" | "md" | "lg";
        lineHeight: "tight" | "normal" | "relaxed";
        weight: "regular" | "medium" | "semibold" | "bold";
        color: "inherit" | "--color-text" | "--color-text-muted" | "--color-primary" | "--color-accent" | "--color-border";
      };
    }
  | {
      id: string;
      type: "quote";
      data: {
        text: string;
        author?: string;
        style: "default" | "bordered" | "pull";
        icon: string | null;
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
      data: { code: string; language: string; showLineNumbers: boolean; theme: "dark" | "light"; showCopyButton: boolean };
    }
  | {
      id: string;
      type: "callout";
      data: {
        text: string;
        variant: "info" | "warning" | "tip" | "danger";
        icon: string | null;
        title?: string;
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
        rounded: "none" | "sm" | "md" | "lg" | "full";
        border: "none" | "thin" | "medium" | "thick";
        shadow: "none" | "sm" | "md" | "lg" | "xl";
        hoverZoom: boolean;
        link?: string;
        objectFit: "cover" | "contain" | "fill";
      };
    }
  | {
      id: string;
      type: "video";
      data: {
        mediaId: string;
        caption?: string;
        aspectRatio: "16:9" | "4:3" | "9:16" | "1:1";
        rounded: "none" | "sm" | "md" | "lg" | "full";
        shadow: "none" | "sm" | "md" | "lg" | "xl";
        autoplay: boolean;
        loop: boolean;
        showControls: boolean;
        thumbnail?: string;
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
        rounded: "none" | "sm" | "md" | "lg" | "full";
        shadow: "none" | "sm" | "md" | "lg" | "xl";
        hoverZoom: boolean;
        lightbox: boolean;
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
        transition: "slide" | "fade" | "cube";
        rounded: "none" | "sm" | "md" | "lg" | "full";
        shadow: "none" | "sm" | "md" | "lg" | "xl";
        aspectRatio: "16:9" | "4:3" | "1:1" | "auto";
        loop: boolean;
        pauseOnHover: boolean;
        slidesPerView: number;
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
        orientation: "horizontal" | "vertical";
        rounded: "none" | "sm" | "md" | "lg" | "full";
        shadow: "none" | "sm" | "md" | "lg" | "xl";
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
      data: {
        columns: 2 | 3 | 4;
        content: Content[];
        gap: "sm" | "md" | "lg";
        columnRatios: "auto" | "50-50" | "33-33-33" | "25-75" | "75-25" | "33-67" | "67-33";
      };
    }
  | {
      id: string;
      type: "tabs";
      data: {
        tabs: { label: string; content: Content }[];
        tabStyle: "top" | "pills" | "vertical";
        defaultTab: number;
      };
    }
  | {
      id: string;
      type: "accordion";
      data: {
        items: { title: string; content: Content }[];
        allowMultiple: boolean;
        iconPosition: "left" | "right";
        defaultOpenIndex: number;
        borderStyle: "bordered" | "borderless";
      };
    }
  | {
      id: string;
      type: "collapse";
      data: {
        title: string;
        content: Content;
        defaultOpen: boolean;
        iconPosition: "left" | "right";
      };
    }
  | {
      id: string;
      type: "timeline";
      data: {
        events: { date: string; title: string; description: string }[];
        layout: "vertical" | "horizontal" | "alternating";
        iconPerEvent: string | null;
        lineColor: "--color-border" | "--color-primary" | "--color-accent";
      };
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
        buttonStyle: "solid" | "outline" | "ghost";
        buttonSize: "sm" | "md" | "lg";
        buttonIcon: string | null;
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
        currency: string;
        billingPeriod: "monthly" | "yearly";
        layout: "horizontal" | "vertical";
      };
    }
  | {
      id: string;
      type: "testimonial";
      data: {
        testimonialId: string;
        style: "card" | "inline" | "large";
        showAvatar: boolean;
        showRating: boolean;
        avatarSize: "sm" | "md" | "lg";
        background: "none" | "light" | "dark" | "gradient";
      };
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

// ─── Shared type exports ──────────────────────────

export type Rounded = z.infer<typeof roundedSchema>;
export type Shadow = z.infer<typeof shadowSchema>;
export type Alignment = z.infer<typeof alignmentSchema>;
export type ColorVar = z.infer<typeof colorSchema>;
