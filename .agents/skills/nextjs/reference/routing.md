# Routing Reference

## Dynamic routes
```
app/blog/[slug]/page.tsx       → /blog/:slug
app/shop/[...slug]/page.tsx    → /shop/a, /shop/a/b, /shop/a/b/c
app/docs/[[...slug]]/page.tsx  → /docs, /docs/a, /docs/a/b
```

### Route group (excluded from URL)
```
app/(marketing)/page.tsx     → /
app/(marketing)/about/page.tsx → /about
app/(shop)/cart/page.tsx     → /cart
```

### Private folder (excluded from routing)
```
app/blog/_components/Post.tsx → not routable
app/blog/_lib/data.ts         → not routable
```

## Parallel routes
Render multiple pages in same view via named slots:
```
app/
├── layout.tsx         # must accept @sidebar and @main props
├── @sidebar/
│   └── page.tsx
└── @main/
    └── page.tsx
```

```tsx
// layout.tsx
export default function Layout(props: {
  children: React.ReactNode
  sidebar: React.ReactNode
  main: React.ReactNode
}) {
  return (
    <div>
      {props.sidebar}
      {props.main}
      {props.children}  {/* default slot */}
    </div>
  )
}
```

### default.js for parallel routes
Fallback when a slot doesn't match the current route:
```
app/@sidebar/default.tsx  → shows when @sidebar has no matching page
```

## Intercepting routes
Render a route inside current layout without URL change:
```
(.)folder   → same level intercept    (app/(.)photo/page.tsx)
(..)folder  → one level up intercept
(...)folder → from root intercept
```
Common pattern: Modal overlay for item details over a list.

## Route handlers (`route.js`)
```ts
// app/api/posts/route.ts
export async function GET(request: NextRequest) {
  const data = await db.post.findMany()
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const post = await db.post.create({ data: body })
  return NextResponse.json(post, { status: 201 })
}
```

### Route segment config
```ts
export const dynamic = 'force-dynamic'   // force dynamic rendering
export const dynamicParams = false       // 404 on unknown params
export const revalidate = 3600           // ISR revalidate (previous model)
export const maxDuration = 60            // max function duration (seconds)
export const runtime = 'edge'            // 'nodejs' | 'edge'
export const preferredRegion = 'iad1'    // deployment region
```

## Linking & Navigation

### Prefetching
`<Link>` automatically prefetches when links enter viewport. Prefetch behavior depends on route type:
- Static routes: fully prefetched
- Dynamic routes: partial prefetch (loading.js is recommended)

```tsx
// Disable prefetch
<Link href="/page" prefetch={false}>Page</Link>
```

### Navigation patterns
```tsx
'use client'
import { useRouter } from 'next/navigation'

export function Navigation() {
  const router = useRouter()
  return (
    <button onClick={() => router.push('/dashboard')}>Go</button>
  )
}
```

- `router.push(href)` — client-side navigation
- `router.replace(href)` — replace history entry
- `router.refresh()` — refresh current route
- `router.prefetch(href)` — manual prefetch
- `router.back()` / `router.forward()` — history navigation

### Navigation order
1. Server renders component payload
2. Streaming sends data as ready
3. Client-side transition when possible
4. Route Segment Config controls behavior
