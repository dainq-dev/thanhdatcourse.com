import { describe, test, expect } from "bun:test";
import {
  HeadingBlock,
  ParagraphBlock,
  QuoteBlock,
  ListBlock,
  CodeBlock,
  CalloutBlock,
  ImageBlock,
  VideoBlock,
  GalleryBlock,
  CarouselBlock,
  BeforeAfterBlock,
  DividerBlock,
  SpacerBlock,
  ColumnsBlock,
  TabsBlock,
  AccordionBlock,
  CollapseBlock,
  TimelineBlock,
  TableBlock,
  CTABlock,
  PricingTableBlock,
  TestimonialBlock,
  BlockSchema,
  ContentSchema,
} from "./blocks";

const uuid = "550e8400-e29b-41d4-a716-446655440000";
const uuid2 = "550e8400-e29b-41d4-a716-446655440001";
const uuid3 = "550e8400-e29b-41d4-a716-446655440002";

describe("BlockSchemas — each block type parses valid data", () => {
  test("heading", () => {
    const result = HeadingBlock.parse({
      id: uuid,
      type: "heading",
      data: { level: 2, text: "Hello", alignment: "center" },
    });
    expect(result.data.level).toBe(2);
    expect(result.data.text).toBe("Hello");
  });

  test("paragraph", () => {
    const result = ParagraphBlock.parse({
      id: uuid,
      type: "paragraph",
      data: { text: "Some text" },
    });
    expect(result.data.dropCap).toBe(false);
  });

  test("quote", () => {
    const result = QuoteBlock.parse({
      id: uuid,
      type: "quote",
      data: { text: "Quote text", author: "Author", style: "bordered" },
    });
    expect(result.data.style).toBe("bordered");
  });

  test("list", () => {
    const result = ListBlock.parse({
      id: uuid,
      type: "list",
      data: { style: "ordered", items: ["a", "b"] },
    });
    expect(result.data.items).toHaveLength(2);
  });

  test("code", () => {
    const result = CodeBlock.parse({
      id: uuid,
      type: "code",
      data: { code: "console.log(1)", language: "ts", showLineNumbers: true },
    });
    expect(result.data.language).toBe("ts");
  });

  test("callout", () => {
    const result = CalloutBlock.parse({
      id: uuid,
      type: "callout",
      data: { text: "Note", variant: "info" },
    });
    expect(result.data.variant).toBe("info");
  });

  test("image", () => {
    const result = ImageBlock.parse({
      id: uuid,
      type: "image",
      data: { mediaId: uuid2, width: "full" },
    });
    expect(result.data.width).toBe("full");
  });

  test("video", () => {
    const result = VideoBlock.parse({
      id: uuid,
      type: "video",
      data: { mediaId: "yt-123" },
    });
    expect(result.data.aspectRatio).toBe("16:9");
  });

  test("gallery", () => {
    const result = GalleryBlock.parse({
      id: uuid,
      type: "gallery",
      data: {
        images: [{ mediaId: uuid2 }, { mediaId: uuid3 }],
        columns: 2,
      },
    });
    expect(result.data.images).toHaveLength(2);
  });

  test("carousel", () => {
    const result = CarouselBlock.parse({
      id: uuid,
      type: "carousel",
      data: {
        slides: [{ mediaId: uuid2, caption: "Slide 1" }],
        autoplay: true,
      },
    });
    expect(result.data.autoplay).toBe(true);
  });

  test("beforeAfter", () => {
    const result = BeforeAfterBlock.parse({
      id: uuid,
      type: "beforeAfter",
      data: { beforeMediaId: uuid2, afterMediaId: uuid3 },
    });
    expect(result.data.beforeLabel).toBe("Before");
  });

  test("divider", () => {
    const result = DividerBlock.parse({
      id: uuid,
      type: "divider",
      data: { style: "dashed" },
    });
    expect(result.data.style).toBe("dashed");
  });

  test("spacer", () => {
    const result = SpacerBlock.parse({
      id: uuid,
      type: "spacer",
      data: { height: 64 },
    });
    expect(result.data.height).toBe(64);
  });

  test("columns", () => {
    const result = ColumnsBlock.parse({
      id: uuid,
      type: "columns",
      data: {
        columns: 2,
        content: [
          [
            { id: uuid2, type: "heading", data: { level: 1, text: "Col 1" } },
          ],
          [
            { id: uuid3, type: "paragraph", data: { text: "Col 2" } },
          ],
        ],
      },
    });
    expect(result.data.content).toHaveLength(2);
  });

  test("tabs", () => {
    const result = TabsBlock.parse({
      id: uuid,
      type: "tabs",
      data: {
        tabs: [
          {
            label: "Tab 1",
            content: [{ id: uuid2, type: "paragraph", data: { text: "Hello" } }],
          },
        ],
      },
    });
    expect(result.data.tabs).toHaveLength(1);
  });

  test("accordion", () => {
    const result = AccordionBlock.parse({
      id: uuid,
      type: "accordion",
      data: {
        items: [
          {
            title: "FAQ 1",
            content: [{ id: uuid2, type: "paragraph", data: { text: "Answer" } }],
          },
        ],
      },
    });
    expect(result.data.items[0]!.title).toBe("FAQ 1");
  });

  test("collapse", () => {
    const result = CollapseBlock.parse({
      id: uuid,
      type: "collapse",
      data: {
        title: "Details",
        content: [{ id: uuid2, type: "paragraph", data: { text: "Hidden text" } }],
        defaultOpen: true,
      },
    });
    expect(result.data.defaultOpen).toBe(true);
  });

  test("timeline", () => {
    const result = TimelineBlock.parse({
      id: uuid,
      type: "timeline",
      data: {
        events: [{ date: "2024", title: "Event", description: "Desc" }],
      },
    });
    expect(result.data.events).toHaveLength(1);
  });

  test("table", () => {
    const result = TableBlock.parse({
      id: uuid,
      type: "table",
      data: {
        headers: ["A", "B"],
        rows: [["1", "2"]],
      },
    });
    expect(result.data.striped).toBe(true);
  });

  test("cta", () => {
    const result = CTABlock.parse({
      id: uuid,
      type: "cta",
      data: {
        heading: "Join Now",
        buttonText: "Sign Up",
        buttonUrl: "/signup",
        style: "primary",
      },
    });
    expect(result.data.style).toBe("primary");
  });

  test("pricingTable", () => {
    const result = PricingTableBlock.parse({
      id: uuid,
      type: "pricingTable",
      data: {
        plans: [
          {
            name: "Basic",
            price: "0",
            features: ["Feature 1"],
            cta: { text: "Start", url: "/start" },
            highlighted: true,
          },
        ],
      },
    });
    expect(result.data.plans[0]!.highlighted).toBe(true);
  });

  test("testimonial", () => {
    const result = TestimonialBlock.parse({
      id: uuid,
      type: "testimonial",
      data: { testimonialId: uuid2, style: "inline" },
    });
    expect(result.data.style).toBe("inline");
  });
});

describe("Invalid block type is rejected", () => {
  test("BlockSchema rejects unknown type", () => {
    expect(() =>
      BlockSchema.parse({ id: uuid, type: "unknown_block", data: {} })
    ).toThrow();
  });
});

describe("Recursive nested structure", () => {
  test("columns inside accordion", () => {
    const data = {
      id: uuid,
      type: "accordion",
      data: {
        items: [
          {
            title: "Section",
            content: [
              {
                id: uuid2,
                type: "columns",
                data: {
                  columns: 2,
                  content: [
                    [
                      { id: uuid3, type: "heading", data: { level: 3, text: "Left" } },
                    ],
                    [
                      { id: "660e8400-e29b-41d4-a716-446655440010", type: "paragraph", data: { text: "Right" } },
                    ],
                  ],
                },
              },
            ],
          },
        ],
        allowMultiple: true,
      },
    };

    const result = BlockSchema.parse(data);
    const itemContent = (result as any).data.items[0].content;
    expect(itemContent).toHaveLength(1);
    expect(itemContent[0].type).toBe("columns");
  });
});

describe("Deep nesting doesn't crash", () => {
  function buildNestedColumns(depth: number): any {
    if (depth === 0) {
      return { id: uuid, type: "heading", data: { level: 1, text: "Leaf" } };
    }
    return {
      id: crypto.randomUUID(),
      type: "columns",
      data: {
        columns: 2,
        content: [
          [buildNestedColumns(depth - 1)],
          [{ id: crypto.randomUUID(), type: "spacer", data: { height: 20 } }],
        ],
      },
    };
  }

  test("50-level nesting parses without crashing", () => {
    const nested = buildNestedColumns(50);
    const result = BlockSchema.parse(nested);
    expect(result.type).toBe("columns");
  });
});

describe("Empty blocks array", () => {
  test("ContentSchema accepts empty array", () => {
    const result = ContentSchema.parse([]);
    expect(result).toEqual([]);
  });

  test("ContentSchema parses single block", () => {
    const result = ContentSchema.parse([
      { id: uuid, type: "heading", data: { level: 1, text: "Title" } },
    ]);
    expect(result).toHaveLength(1);
  });
});
