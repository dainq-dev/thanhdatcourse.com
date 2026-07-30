import type { Block } from "@workspace/types";
import { CTABlock } from "./conversion/CTABlock";
import { PricingBlock } from "./conversion/PricingBlock";
import { TestimonialBlock } from "./conversion/TestimonialBlock";
import { AccordionBlock } from "./interactive/AccordionBlock";
import { CollapseBlock } from "./interactive/CollapseBlock";
import { TableBlock } from "./interactive/TableBlock";
import { TabsBlock } from "./layout/TabsBlock";
import { TimelineBlock } from "./interactive/TimelineBlock";
import { ColumnsBlock } from "./layout/ColumnsBlock";
import { DividerBlock } from "./layout/DividerBlock";
import { SpacerBlock } from "./layout/SpacerBlock";
import { BeforeAfterBlock } from "./media/BeforeAfterBlock";
import { CarouselBlock } from "./media/CarouselBlock";
import { GalleryBlock } from "./media/GalleryBlock";
import { ImageBlock } from "./media/ImageBlock";
import { VideoBlock } from "./media/VideoBlock";
import { CalloutBlock } from "./typography/CalloutBlock";
import { CodeBlock } from "./typography/CodeBlock";
import { HeadingBlock } from "./typography/HeadingBlock";
import { ListBlock } from "./typography/ListBlock";
import { ParagraphBlock } from "./typography/ParagraphBlock";
import { QuoteBlock } from "./typography/QuoteBlock";

type BlockComp = React.ComponentType<{ data: unknown }>;

const BLOCK_MAP: Record<string, BlockComp> = {
  heading: HeadingBlock as BlockComp,
  paragraph: ParagraphBlock as BlockComp,
  quote: QuoteBlock as BlockComp,
  list: ListBlock as BlockComp,
  code: CodeBlock as BlockComp,
  callout: CalloutBlock as BlockComp,
  image: ImageBlock as BlockComp,
  video: VideoBlock as BlockComp,
  gallery: GalleryBlock as BlockComp,
  carousel: CarouselBlock as BlockComp,
  beforeAfter: BeforeAfterBlock as BlockComp,
  divider: DividerBlock as BlockComp,
  spacer: SpacerBlock as BlockComp,
  columns: ColumnsBlock as BlockComp,
  tabs: TabsBlock as BlockComp,
  accordion: AccordionBlock as BlockComp,
  collapse: CollapseBlock as BlockComp,
  timeline: TimelineBlock as BlockComp,
  table: TableBlock as BlockComp,
  cta: CTABlock as BlockComp,
  pricingTable: PricingBlock as BlockComp,
  testimonial: TestimonialBlock as BlockComp,
};

function renderBlock(block: Block) {
  const Comp = BLOCK_MAP[block.type];
  if (!Comp) {
    console.warn(`Unknown block type: ${block.type}`);
    return null;
  }
  return <Comp key={block.id} data={block.data} />;
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks || blocks.length === 0) return null;
  return <div className="block-content">{blocks.map(renderBlock)}</div>;
}
