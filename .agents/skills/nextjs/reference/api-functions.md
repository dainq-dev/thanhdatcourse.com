# API Functions & Hooks Reference

## Server-side functions (import from `next/headers`)

### `cookies()`
```ts
import { cookies } from 'next/headers'
const cookieStore = await cookies()
cookieStore.get('name')
cookieStore.getAll()
cookieStore.has('name')
cookieStore.set('name', 'value', { httpOnly: true, secure: true })
cookieStore.delete('name')
```
Opts into dynamic rendering.

### `headers()`
```ts
import { headers } from 'next/headers'
const headersList = await headers()
headersList.get('authorization')
```
Opts into dynamic rendering.

### `connection()`
```ts
import { connection } from 'next/headers'
const conn = await connection()
```

## Navigation functions (import from `next/navigation`)

### `redirect(url, type?)`
307 temporary redirect. Throws `NEXT_REDIRECT` error.
```ts
import { redirect } from 'next/navigation'
redirect('/login')
```

### `permanentRedirect(url, type?)`
308 permanent redirect.
```ts
import { permanentRedirect } from 'next/navigation'
permanentRedirect('/new-url')
```

### `notFound()`
Triggers `not-found.js` with 404 status.
```ts
import { notFound } from 'next/navigation'
// In Server Component or Route Handler:
if (!post) notFound()
```

### `forbidden()` / `unauthorized()`
Requires `authInterrupts: true` in config.
```ts
import { forbidden } from 'next/navigation'
import { unauthorized } from 'next/navigation'
```

## Cache functions (import from `next/cache`)

### `revalidatePath(path, type?)`
```ts
import { revalidatePath } from 'next/cache'
revalidatePath('/posts')       // revalidate /posts
revalidatePath('/posts', 'layout') // revalidate layout data too
revalidatePath('/posts/[id]', 'page') // revalidate matching pages
```

### `revalidateTag(tag)`
```ts
import { revalidateTag } from 'next/cache'
revalidateTag('posts')
```

### `cacheTag(tag)`
```ts
import { cacheTag } from 'next/cache'
cacheTag('products')
```

### `cacheLife(profile)`
```ts
import { cacheLife } from 'next/cache'
cacheLife('hours')  // profile defined in next.config.js
```

### `updateTag(tag, revalidate)`
```ts
import { updateTag } from 'next/cache'
updateTag('posts', 3600)  // set revalidation period
```

### `refresh()`
Client-side refresh of current route from server.

### `unstable_cache(fn, keyParts, options)` (legacy)
```ts
import { unstable_cache } from 'next/cache'
const getCachedPosts = unstable_cache(
  async () => await db.post.findMany(),
  ['posts'],
  { revalidate: 3600, tags: ['posts'] }
)
```

### `unstable_noStore()` (legacy)
Opt out of caching for a specific call.

### `unstable_rethrow(error)`
Re-throw with proper Next.js internal error handling.
```ts
import { unstable_rethrow } from 'next/navigation'
try { /* ... */ } catch (error) {
  unstable_rethrow(error)
  // handle other errors...
}
```

## Draft mode (import from `next/headers`)

```ts
import { draftMode } from 'next/headers'

// Route handler:
const draft = await draftMode()
draft.enable()
draft.disable()
const isDraft = draft.isEnabled
```

## `after()` (import from `next/server`)
Execute code after response is sent:
```ts
import { after } from 'next/server'

export default async function Page() {
  after(async () => {
    await analytics.log('page viewed')
  })
  return <div>...</div>
}
```

## Client-side hooks

### `useRouter()` (import from `next/navigation`)
```tsx
const router = useRouter()
router.push('/dashboard')
router.replace('/dashboard')
router.refresh()
router.prefetch('/about')
router.back()
router.forward()
```

### `usePathname()`
```tsx
import { usePathname } from 'next/navigation'
const pathname = usePathname()  // '/blog/hello-world'
```

### `useSearchParams()`
```tsx
import { useSearchParams } from 'next/navigation'
const searchParams = useSearchParams()
const query = searchParams.get('query')
```
Use `useSearchParams` only on client. For server, use `searchParams` prop.

### `useParams()`
```tsx
import { useParams } from 'next/navigation'
// For app/blog/[slug]/page.tsx:
const params = useParams()  // { slug: 'hello-world' }
```
Use `params` prop in Server Components instead.

### `useLinkStatus(href)`
```tsx
import { useLinkStatus } from 'next/link'
const { pending } = useLinkStatus('/dashboard')
```

### `useSelectedLayoutSegment()` / `useSelectedLayoutSegments()`
```tsx
import { useSelectedLayoutSegment } from 'next/navigation'
const segment = useSelectedLayoutSegment()  // 'blog'
const segments = useSelectedLayoutSegments() // ['blog', 'hello-world']
```

### `useReportWebVitals(metric)`
```tsx
import { useReportWebVitals } from 'next/web-vitals'
export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)
  })
}
```

## Server-side utilities

### `NextRequest` & `NextResponse` (import from `next/server`)
```ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.cookies.set('token', 'value')
  
  // Redirect
  return NextResponse.redirect(new URL('/login', request.url))
  // Rewrite
  return NextResponse.rewrite(new URL('/new-page', request.url))
}
```

### `ImageResponse` (import from `next/og`)
```tsx
import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ fontSize: 128, background: 'white' }}>
        Hello, World!
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

### `userAgent` (import from `next/server`)
```ts
import { userAgent } from 'next/server'
const { browser, device, os, isBot } = userAgent({ headers })
```

## Metadata functions

### `generateMetadata(props)`
```ts
export async function generateMetadata({ params, searchParams }) {
  return { title: 'Page Title', description: '...' }
}
```

### `generateStaticParams()`
```ts
export async function generateStaticParams() {
  return [{ slug: 'a' }, { slug: 'b' }]
}
```

### `generateViewport()`
```ts
export function generateViewport() {
  return { themeColor: 'black', width: 'device-width' }
}
```

### `generateImageMetadata()`
```ts
export function generateImageMetadata({ params }) {
  return [{ alt: '...', contentType: 'image/png', size: { width: 1200, height: 630 }, id: params.slug }]
}
```

### `generateSitemaps()`
```ts
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }]  // multiple sitemaps
}
```
