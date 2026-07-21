# Caching (Previous Model)

For projects not using Cache Components (`"use cache"` directive). This covers the traditional Next.js caching strategy using `fetch` options, `unstable_cache`, and route segment configs.

## Fetch-level caching

### `force-cache` (default)
```ts
// Cached automatically
const data = await fetch('https://api.example.com/data')
```

### `no-store` (dynamic)
```ts
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store',
})
```

### ISR with `revalidate`
```ts
// Revalidate every 60 seconds
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
})
```

### Tags for on-demand revalidation
```ts
const data = await fetch('https://api.example.com/data', {
  next: { tags: ['posts'] },
})

// Revalidate: revalidateTag('posts')
```

## `unstable_cache` (API-level caching)

```ts
import { unstable_cache } from 'next/cache'

const getCachedPosts = unstable_cache(
  async (authorId: string) => {
    return await db.post.findMany({ where: { authorId } })
  },
  ['posts'], // cache key parts
  {
    revalidate: 3600,  // seconds
    tags: ['posts'],
  }
)

// Usage
const posts = await getCachedPosts('user-123')
```

### `unstable_noStore`
Opt out of caching for a specific call:
```ts
import { unstable_noStore } from 'next/cache'

export default async function Page() {
  unstable_noStore()
  const data = await db.query()
}
```

## Route Segment Config

### `dynamic`
```ts
export const dynamic = 'auto'           // default
export const dynamic = 'force-dynamic'  // always dynamic
export const dynamic = 'force-static'   // force static (errors if uses dynamic APIs)
```

### `revalidate`
```ts
export const revalidate = 3600  // ISR: revalidate every hour
export const revalidate = false // default (heuristic caching)
export const revalidate = 0     // always dynamic (same as force-dynamic)
```

### `dynamicParams`
```ts
export const dynamicParams = true   // default: generate unknown params on demand
export const dynamicParams = false  // 404 on params not in generateStaticParams
```

### `fetchCache`
Controls caching of fetch requests within the segment:
```ts
export const fetchCache = 'auto'            // default
export const fetchCache = 'default-cache'   // cache fetch (override layout)
export const fetchCache = 'only-cache'      // ensure all fetch are cached
export const fetchCache = 'force-cache'     // cache all fetch
export const fetchCache = 'force-no-store'  // no cache
export const fetchCache = 'default-no-store'// no cache by default
export const fetchCache = 'only-no-store'   // ensure all fetch are uncached
```

### `runtime`
```ts
export const runtime = 'nodejs'  // default
export const runtime = 'edge'    // Edge Runtime
```

### `maxDuration`
```ts
export const maxDuration = 60  // max seconds (Hobby: 10, Pro: 60, Enterprise: configurable)
```

### `preferredRegion`
```ts
export const preferredRegion = 'iad1'  // specific region
export const preferredRegion = 'home'  // same region as edge config
export const preferredRegion = 'auto'  // automatic
```

## Static generation with `generateStaticParams`

```ts
export async function generateStaticParams() {
  const posts = await fetch('https://...').then(r => r.json())
  return posts.map(post => ({ slug: post.slug }))
}

// With revalidate (ISR):
export const revalidate = 3600
```

## Incremental Static Regeneration (ISR)

Revalidate static pages at runtime:
```ts
export const revalidate = 3600 // seconds

export default async function Page() {
  const data = await fetch('https://api.example.com', {
    next: { revalidate: 3600 },
  })
  // ...
}
```

### On-demand ISR
```ts
// Route handler:
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  // After content update:
  revalidatePath('/blog/[slug]')
  return Response.json({ revalidated: true })
}
```

## `staleTimes` (client-side router cache)

```js
// next.config.js
module.exports = {
  staleTimes: {
    dynamic: 30,   // client cache for dynamic routes
    static: 300,   // client cache for static routes
  },
}
```

## Prefetching behavior

```tsx
<Link href="/page" prefetch={true}>  // default: prefetch in viewport
<Link href="/page" prefetch={false}> // no prefetch
<Link href="/page" prefetch={null}>  // prefetch on hover only
```

## Migration to Cache Components

To migrate from this model to the new Cache Components model (`"use cache"`):
1. Enable `cacheComponents: true` in `next.config.js`
2. Replace `fetch(..., { next: { revalidate } })` with `"use cache"` functions
3. Replace `unstable_cache` with `"use cache"` functions
4. Replace route segment `revalidate` with `cacheLife()` profiles
5. Use `cacheTag()` instead of `{ tags: [...] }` option
