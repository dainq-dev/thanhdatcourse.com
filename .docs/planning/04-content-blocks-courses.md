# Planning 04: Content Blocks & Course Curriculum System

**Part of:** Delivery Planning
**Ref:** Specs 02, 03, 05; DYNAMIC-CONVERSION-BLUEPRINT.md Sections 9, 10
**Status:** Draft

---

## 1. Block Content System — Component-Driven Content

### Concept

Instead of a rich text editor (textarea with HTML), content is composed of **typed blocks**. Each block is a self-contained component with its own schema, editor UI, and render logic.

```
┌────────────────────────────────────────────────────────────────┐
│                    BLOCK LIFECYCLE                              │
│                                                                 │
│  ADMIN CREATES                    VISITOR VIEWS                 │
│  ─────────────                    ─────────────                  │
│                                                                 │
│  + Add Block ▼                   ┌──────────────────────────┐  │
│  ┌──────────┐                    │  BlockRenderer            │  │
│  │ Heading   │ ──save──► JSON    │                           │  │
│  │ Paragraph │           Array   │  Map type → Component:    │  │
│  │ Image     │           in DB   │                           │  │
│  │ Video     │                   │  heading → <HeadingBlock> │  │
│  │ Gallery   │                   │  image   → <ImageBlock>   │  │
│  │ Accordion │                   │  video   → <VideoBlock>   │  │
│  │ CTA       │                   │  ...                      │  │
│  │ ...       │                   └──────────────────────────┘  │
│  └──────────┘                                                   │
└────────────────────────────────────────────────────────────────┘
```

### Where Block Content is Used

| Usage | DB Column | Editor |
|-------|-----------|--------|
| Blog article content | `posts.content_blocks` | Admin post editor |
| Course introduction | `courses.content_blocks` | Admin course editor (Tab "Giới thiệu") |
| Course lesson content (type=text) | `course_lessons.content_blocks` | Admin curriculum builder |
| Landing pages (future) | Custom table | Admin page builder |

### Block Type Registry

```typescript
// apps/web/src/components/blocks/registry.ts
import type { Block, BlockType } from '@workspace/types';

// Typography
import { HeadingBlock } from './typography/HeadingBlock';
import { ParagraphBlock } from './typography/ParagraphBlock';
import { QuoteBlock } from './typography/QuoteBlock';
import { ListBlock } from './typography/ListBlock';
import { CodeBlock } from './typography/CodeBlock';
import { CalloutBlock } from './typography/CalloutBlock';

// Media
import { ImageBlock } from './media/ImageBlock';
import { VideoBlock } from './media/VideoBlock';
import { GalleryBlock } from './media/GalleryBlock';
import { CarouselBlock } from './media/CarouselBlock';
import { BeforeAfterBlock } from './media/BeforeAfterBlock';

// Layout
import { DividerBlock } from './layout/DividerBlock';
import { SpacerBlock } from './layout/SpacerBlock';
import { ColumnsBlock } from './layout/ColumnsBlock';
import { TabsBlock } from './layout/TabsBlock';

// Interactive
import { AccordionBlock } from './interactive/AccordionBlock';
import { CollapseBlock } from './interactive/CollapseBlock';
import { TimelineBlock } from './interactive/TimelineBlock';
import { TableBlock } from './interactive/TableBlock';

// Conversion
import { CTABlock } from './conversion/CTABlock';
import { PricingBlock } from './conversion/PricingBlock';
import { TestimonialBlock } from './conversion/TestimonialBlock';

// Registry — used by both editor (admin) and renderer (public)
export const BLOCK_REGISTRY: Record<BlockType, {
  label: string;
  category: 'typography' | 'media' | 'layout' | 'interactive' | 'conversion';
  icon: string;
  component: React.ComponentType<{ data: any }>;
  editorComponent: React.ComponentType<{ data: any; onChange: (data: any) => void }>;
}> = {
  heading:     { label: 'Tiêu đề',    category: 'typography',  icon: 'H',  component: HeadingBlock,    editorComponent: HeadingEditor },
  paragraph:   { label: 'Đoạn văn',   category: 'typography',  icon: '¶',  component: ParagraphBlock,  editorComponent: ParagraphEditor },
  image:       { label: 'Ảnh',        category: 'media',       icon: '🖼', component: ImageBlock,      editorComponent: ImageEditor },
  // ... all 21 types
};
```

---

## 2. Block Editor Architecture (Admin)

### Component Tree

```
BlockEditor
├── BlockToolbar (+ menu, undo/redo)
├── BlockList (sortable)
│   ├── BlockWrapper (drag handle, toolbar, delete)
│   │   ├── HeadingEditor
│   │   ├── ParagraphEditor
│   │   ├── ImageEditor
│   │   │   └── MediaLibraryModal (opens on "Chọn ảnh")
│   │   ├── AccordionEditor
│   │   │   ├── AccordionItem
│   │   │   │   └── BlockEditor (nested, recursive!)
│   │   │   └── [+ Thêm item]
│   │   └── ColumnsEditor
│   │       ├── Column
│   │       │   └── BlockEditor (nested, recursive!)
│   │       └── Column (2nd, 3rd...)
│   └── [+ Thêm block] (insert between)
└── PreviewToggle (optional split-view)
```

### Editor State Management

```typescript
// Custom hook for block editor state
function useBlockEditor(initialBlocks: Block[] = []) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const { push, undo, redo, canUndo, canRedo } = useUndoHistory<Block[]>(50);

  const addBlock = useCallback((type: BlockType, index?: number) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      data: getDefaultData(type),
    };
    setBlocks(prev => {
      const next = [...prev];
      index !== undefined ? next.splice(index, 0, newBlock) : next.push(newBlock);
      push(next);
      return next;
    });
  }, [push]);

  const updateBlock = useCallback((blockId: string, data: any) => {
    setBlocks(prev => {
      const next = prev.map(b => b.id === blockId ? { ...b, data } : b);
      push(next);
      return next;
    });
  }, [push]);

  const removeBlock = useCallback((blockId: string) => {
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== blockId);
      push(next);
      return next;
    });
  }, [push]);

  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks(prev => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed!);
      push(next);
      return next;
    });
  }, [push]);

  return { blocks, addBlock, updateBlock, removeBlock, reorderBlocks, undo, redo, canUndo, canRedo };
}
```

### Drag & Drop Implementation

Use `@dnd-kit/core` (lightweight, tree-shakeable):

```tsx
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function BlockList({ blocks, reorderBlocks, updateBlock, removeBlock }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id) {
          const fromIndex = blocks.findIndex(b => b.id === active.id);
          const toIndex = blocks.findIndex(b => b.id === over.id);
          reorderBlocks(fromIndex, toIndex);
        }
      }}>
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map((block, index) => (
          <SortableBlock key={block.id} block={block} index={index}
            onUpdate={(data) => updateBlock(block.id, data)}
            onRemove={() => removeBlock(block.id)}
            onAddBlock={(type) => addBlock(type, index + 1)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

---

## 3. Course Curriculum Builder

### Module → Lesson Tree Structure

```
Course
├── Module 1: "Nhập môn tư duy màu sắc"
│   ├── Lesson 1.1: "Giới thiệu" [video, 08:15, free preview]
│   ├── Lesson 1.2: "Vòng tròn màu sắc" [video, 06:44]
│   └── Lesson 1.3: "Bài tập thực hành" [assignment, 15:00]
│
├── Module 2: "Ánh sáng — Nền tảng"
│   ├── Lesson 2.1: "Ánh sáng tự nhiên" [video, 08:15]
│   ├── Lesson 2.2: "Cân bằng trắng" [video, 10:22]
│   ├── Lesson 2.3: "3-point lighting" [video, 12:05, free preview]
│   ├── Lesson 2.4: "Thực hành setup" [video, 20:00]
│   └── Lesson 2.5: "Tài liệu tham khảo" [resource]
│
└── Module 3: ...
```

### Admin UI — Curriculum Tab

```
┌─ CURRICULUM ─────────────────────────────────────────────────┐
│                                                               │
│  8 Chương • 42 Bài • 12h 30ph    [▼ Thu gọn] [▶ Mở rộng]    │
│                                                               │
│  ┌─ CHƯƠNG 1: Nhập môn tư duy màu sắc ─────────────────┐   │
│  │  Mô tả: [Hiểu bản chất màu sắc và ảnh hưởng...    ]   │   │
│  │  Outcomes: [+ Thêm]                                     │   │
│  │  ────────────────────────────────────────────────────   │   │
│  │  ⠿⋮⋮ 1.1 [Giới thiệu tổng quan          ] 🎬 [08:15]  │   │
│  │         Mô tả: [Tổng quan về khóa học...]               │   │
│  │         URL: [https://youtube.com/...] ☑ Free Preview    │   │
│  │  ⠿⋮⋮ 1.2 [Vòng tròn màu sắc cơ bản      ] 🎬 [06:44]  │   │
│  │  ⠿⋮⋮ 1.3 [Bài tập thực hành             ] 📋 [15:00]  │   │
│  │  ────────────────────────────────────────────────────   │   │
│  │  [+ Thêm bài học]                                        │   │
│  └────────────────────────────────────────────────────────  │   │
│                       ↕ Drag to reorder                      │   │
│  [+ Thêm chương]                                             │   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Curriculum Data Flow

```typescript
// Admin saves curriculum:
// PUT /api/courses/:id/curriculum
{
  modules: [
    {
      id: "uuid-module-1",
      title: "Nhập môn tư duy màu sắc",
      description: "...",
      sort_order: 0,
      learning_outcomes: ["Hiểu vòng tròn màu", "Phân biệt warm/cool"],
      lessons: [
        {
          id: "uuid-lesson-1",
          title: "Giới thiệu",
          type: "video",
          duration_seconds: 495,
          video_url: "https://youtube.com/...",
          is_free_preview: true,
          sort_order: 0
        },
        // ... more lessons
      ]
    },
    // ... more modules
  ]
}

// Frontend renders curriculum as accordion:
// khoa-hoc/[slug]/page.tsx
const res = await api.courses[':id'].curriculum.$get({ param: { id: courseId } });
const curriculum = await res.json();

return (
  <CurriculumAccordion modules={curriculum.modules} />
);
```

---

## 4. Integration: Block Editor in Different Contexts

```typescript
// 1. Blog post editor
// apps/web/src/app/quan-tri-vien/bai-viet/tao-moi/page.tsx
'use client';
import { BlockEditor } from '@/components/blocks/BlockEditor';

export default function CreatePostPage() {
  const { blocks, ...editor } = useBlockEditor();

  const handleSave = async () => {
    await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        title, excerpt, category_id,
        content_blocks: JSON.stringify(blocks),
      }),
    });
  };

  return (
    <div>
      <input placeholder="Tiêu đề" />
      <BlockEditor blocks={blocks} {...editor} />
      <button onClick={handleSave}>Xuất bản</button>
    </div>
  );
}

// 2. Course introduction editor
// Same BlockEditor component, different save endpoint
const handleSave = async () => {
  await fetch(`/api/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify({ content_blocks: JSON.stringify(blocks) }),
  });
};

// 3. Lesson content editor (in curriculum builder)
// Each lesson of type "text" can have content_blocks
<BlockEditor blocks={lesson.content_blocks} />
```

---

## 5. Block Renderer — Public Frontend

```typescript
// apps/web/src/components/blocks/BlockRenderer.tsx
import type { Block } from '@workspace/types';
import { BLOCK_REGISTRY } from './registry';

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="block-content">
      {blocks.map((block) => {
        const entry = BLOCK_REGISTRY[block.type];
        if (!entry) {
          console.warn(`Unknown block type: ${block.type}`);
          return null;
        }
        const Component = entry.component;
        return <Component key={block.id} data={block.data} />;
      })}
    </div>
  );
}
```

Each block component is pure render (Server Component friendly):

```typescript
// apps/web/src/components/blocks/typography/HeadingBlock.tsx
import styles from './HeadingBlock.module.scss';

export function HeadingBlock({ data }: { data: HeadingBlockData }) {
  const Tag = `h${data.level}` as const;
  return (
    <Tag className={styles.heading} style={{ textAlign: data.alignment }}>
      {data.text}
    </Tag>
  );
}

// apps/web/src/components/blocks/media/ImageBlock.tsx
import { ResponsiveImage } from '@/components/media/ResponsiveImage';

export function ImageBlock({ data }: { data: ImageBlockData }) {
  return (
    <figure className={styles.figure} data-width={data.width}>
      <ResponsiveImage mediaId={data.mediaId} alt={data.alt || ''} />
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  );
}
```
