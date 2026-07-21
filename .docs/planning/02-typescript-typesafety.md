# Planning 02: TypeScript Type-Safety System

**Part of:** Delivery Planning
**Ref:** packages/types/, way-of-reasoning.prompt.md, bdd-spec.prompt.md
**Status:** Draft

---

## 1. Philosophy: Zod as Single Source of Truth

Every data structure in this project flows through Zod. The chain is:

```
Zod Schema (packages/types)
    │
    ├──► z.infer<Schema> → TypeScript type (used everywhere)
    │
    ├──► Backend: zValidator middleware → runtime validation + type inference
    │
    ├──► Frontend: Hono RPC client → compile-time type checks on API calls
    │
    └──► Drizzle ORM: table schemas mirror Zod schemas
```

**Rule:** If you need to define a data structure, define it FIRST in `packages/types/src/schemas/`. Never define types in `apps/web` or `apps/api` that duplicate what should be shared.

---

## 2. Schema Organization

```
packages/types/src/
├── index.ts                    Barrel export
├── schemas.ts                  Existing 8 schemas (legacy, keep for reference)
├── utils.ts                    Utility functions (formatVND, formatDate, cx, etc.)
│
├── schemas/
│   ├── course.ts               Course, CourseModule, CourseLesson, Bonus schemas
│   ├── blog.ts                 Post, PostCategory schemas
│   ├── portfolio.ts            PortfolioItem schema
│   ├── product.ts              DigitalProduct schema
│   ├── faq.ts                  FAQ schema
│   ├── testimonial.ts          Testimonial schema
│   ├── lead.ts                 Lead schema
│   ├── promotion.ts            Promotion schema
│   ├── instructor.ts           Instructor schema
│   ├── media.ts                Media, MediaVariant schemas
│   ├── auth.ts                 LoginInput, RegisterInput, User schemas
│   ├── settings.ts             SettingsBatchInput schema
│   ├── blocks.ts               All 21+ block type schemas (Spec 02)
│   └── responses.ts            Standardized API response types
```

### Schema Naming Convention

```typescript
// Each entity has up to 4 schemas:

// 1. The entity itself (used for responses)
const CourseSchema = z.object({ id, slug, title, /* all fields */ });
type Course = z.infer<typeof CourseSchema>;

// 2. Create input (what admin sends to POST)
const CreateCourseSchema = CourseSchema.omit({ id: true }).extend({ /* required override */ });
type CreateCourseDTO = z.infer<typeof CreateCourseSchema>;

// 3. Update input (what admin sends to PUT - all optional)
const UpdateCourseSchema = CreateCourseSchema.partial();
type UpdateCourseDTO = z.infer<typeof UpdateCourseSchema>;

// 4. List query params
const CourseQuerySchema = z.object({ published: z.coerce.boolean().optional(), ... });
type CourseQuery = z.infer<typeof CourseQuerySchema>;
```

---

## 3. Block System Zod Schemas (from Spec 02)

The block system uses **Zod discriminated unions** for type-safe block rendering:

```typescript
// packages/types/src/schemas/blocks.ts

// Base block - every block has id + type
const BaseBlock = z.object({
  id: z.string().uuid(),
  type: z.string(),
});

// Typography blocks
const HeadingBlock = BaseBlock.extend({
  type: z.literal('heading'),
  data: z.object({
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
    text: z.string().min(1),
    alignment: z.enum(['left', 'center', 'right']).default('left'),
  }),
});

const ParagraphBlock = BaseBlock.extend({
  type: z.literal('paragraph'),
  data: z.object({
    text: z.string().min(1),
    alignment: z.enum(['left', 'center', 'right']).default('left'),
    dropCap: z.boolean().default(false),
  }),
});

// Media blocks
const ImageBlock = BaseBlock.extend({
  type: z.literal('image'),
  data: z.object({
    mediaId: z.string().uuid(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.enum(['full', 'wide', 'contained', 'inline']).default('wide'),
    border: z.boolean().default(false),
    rounded: z.boolean().default(false),
  }),
});

// ... 18 more block types ...

// THE RECURSIVE BLOCK TYPE — this is the key to nested blocks
const BlockSchema: z.ZodType<Block> = z.discriminatedUnion('type', [
  HeadingBlock, ParagraphBlock, QuoteBlock, ListBlock, CodeBlock, CalloutBlock,
  ImageBlock, VideoBlock, GalleryBlock, CarouselBlock, BeforeAfterBlock,
  DividerBlock, SpacerBlock,
  // RECURSIVE: ColumnsBlock references BlockSchema inside itself
  z.object({
    id: z.string().uuid(),
    type: z.literal('columns'),
    data: z.object({
      columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
      content: z.array(z.array(z.lazy(() => BlockSchema))), // columns[col] = Block[]
      gap: z.enum(['sm', 'md', 'lg']).default('md'),
    }),
  }),
  // ... more blocks with recursive content ...
]);

export type Block = z.infer<typeof BlockSchema>;
export const ContentSchema = z.array(BlockSchema);
export type Content = z.infer<typeof ContentSchema>;
```

---

## 4. TypeScript Strict Mode Practice

### tsconfig.json — All Packages Must Extend

```json
// packages/config/tsconfig.base.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,                    // All strict checks enabled
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,  // array[index] might be undefined
    "exactOptionalPropertyTypes": false, // Too strict for Zod
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### TypeScript Patterns to Use

```typescript
// 1. NEVER use `any` — use `unknown` and narrow
function parseJSON(data: string): unknown {
  return JSON.parse(data);
}
const result = parseJSON(input);
if (typeof result === 'object' && result !== null) {
  // Type narrowed
}

// 2. Zod's safeParse for runtime validation with type narrowing
const parsed = CourseSchema.safeParse(unknownData);
if (parsed.success) {
  // parsed.data is guaranteed to be Course type
  saveCourse(parsed.data);
} else {
  // parsed.error has detailed validation errors
  return { error: parsed.error.flatten() };
}

// 3. Exhaustive switch for discriminated unions (Block types)
function renderBlock(block: Block) {
  switch (block.type) {
    case 'heading': return <Heading data={block.data} />;  // Typed!
    case 'paragraph': return <Paragraph data={block.data} />;
    // ... all 21 types ...
    default:
      // TypeScript ERROR if any block type is not handled
      const _exhaustive: never = block;
      return null;
  }
}

// 4. Branded types for IDs (prevent mixing up IDs)
type CourseId = string & { __brand: 'CourseId' };
type ModuleId = string & { __brand: 'ModuleId' };
// Now you can't accidentally pass a CourseId where ModuleId is expected

// 5. Type-safe API calls with Hono RPC
const res = await api.courses[':id'].modules.$get({
  param: { id: courseId }
});
// res is typed. No manual type annotations needed.

// 6. Server Component async data fetching
export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const res = await api.courses[':slug'].$get({ param: { slug: params.slug } });
  if (!res.ok) notFound();
  const course = await res.json(); // Fully typed Course
  return <CourseDetail course={course} />;
}
```

---

## 5. Common Pitfalls & Solutions

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Zod schema drift** | DB schema adds column, Zod schema not updated | Drizzle `$inferSelect` type should match Zod `z.infer`. Write a type-level test: `type Test = typeof dbCourse extends Course ? true : false` |
| **any in route handler** | `c.req.json()` returns `unknown`, dev casts to `any` | Use `zValidator` middleware — `c.req.valid('json')` returns the typed data. Never use `c.req.json()` directly. |
| **Hono RPC type not exported** | Forgot `export type AppType = typeof app` | Add lint rule: every `index.ts` in `apps/api/src/` must export its type |
| **Props spread losing types** | `<Component {...data} />` loses type safety | Use explicit props: `<Component title={data.title} price={data.price} />` |
| **Zod optional vs nullable** | `z.string().optional()` = `string \| undefined`; `z.string().nullable()` = `string \| null` | DB stores NULL → use `.nullable()`. Optional fields → use `.optional()`. |
| **Recursive types crash TypeScript** | Too-deep recursion in block type | Zod's `z.lazy()` handles this. Set `exactOptionalPropertyTypes: false` in tsconfig. |

---

## 6. Type Code Generation (None Needed)

One of the biggest advantages of this architecture: **zero code generation**.

| Approach | Codegen needed? |
|----------|-----------------|
| tRPC | Yes (`trpc client`) |
| GraphQL | Yes (graphql-codegen) |
| OpenAPI/Swagger | Yes (openapi-generator) |
| **Hono RPC + Zod** | **No** — types flow automatically |

The TypeScript compiler does all the work. When you change a Zod schema in `packages/types`, all consumers in `apps/web`, `apps/api`, `apps/media` get compile errors instantly. No codegen step, no generated files to commit.
