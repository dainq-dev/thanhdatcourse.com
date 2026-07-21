# File Conventions Reference

## `layout.js`
Shared UI that persists across navigations. Must accept `children`.
```tsx
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div><NavBar />{children}</div>
}
```
- Root layout MUST include `<html>` and `<body>` tags
- Layouts do NOT re-render on navigation
- Can access `params` in nested layouts

## `page.js`
Makes a route publicly accessible.
```tsx
export default async function Page({
  params,       // Promise<{...}>
  searchParams, // Promise<{...}>
}: PageProps<'/blog/[slug]'>) {
  // ...
}
```

## `loading.js`
Suspense fallback shown while page/content loads.
```tsx
export default function Loading() {
  return <p>Loading...</p>
}
```
Created per route segment; wraps `page.js` and children in a Suspense boundary.

## `error.js`
Error boundary for a segment.
```tsx
'use client' // error boundaries must be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```
- Does NOT catch errors in `layout.js` (use `global-error.js` for that)
- `reset()` re-renders the error boundary's children

## `global-error.js`
Catches errors in root layout. Must include `<html>` and `<body>`.
```tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

## `not-found.js`
404 UI for when `notFound()` is called.
```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  )
}
```

## `forbidden.js` & `unauthorized.js`
Requires `authInterrupts: true` in `next.config.js`.
```tsx
// forbidden.js — 403
export default function Forbidden() {
  return <div>Access denied</div>
}

// unauthorized.js — 401
export default function Unauthorized() {
  return <div>Please sign in</div>
}
```

## `template.js`
Like layout but re-renders on every navigation. Use when you need state to reset (e.g., enter/exit animations, `useEffect` on mount).

## `default.js`
Fallback for parallel route slots when no route matches.

## `route.js`
API endpoint. Exports HTTP method handlers:
```ts
export async function GET(request: NextRequest) {}
export async function POST(request: NextRequest) {}
export async function PUT(request: NextRequest) {}
export async function PATCH(request: NextRequest) {}
export async function DELETE(request: NextRequest) {}
export async function HEAD(request: NextRequest) {}
export async function OPTIONS(request: NextRequest) {}
```

### Route segment config options for `route.js`
```ts
export const dynamic = 'auto' | 'force-dynamic' | 'force-static'
export const dynamicParams = true | false
export const revalidate = false | 0 | number
export const fetchCache = 'auto' | 'default-cache' | 'only-cache' | 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'
export const runtime = 'nodejs' | 'edge'
export const maxDuration = number (seconds)
export const preferredRegion = 'iad1' | 'auto' | 'home'
```

## `proxy.js`
Request proxy handler:
```ts
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  // Return undefined to pass through, or a Response to intercept
}
```

## `instrumentation.ts`
Runs at server startup:
```ts
export function register() {
  // Called once when server starts
}
```

## `instrumentation-client.js`
Client-side instrumentation for frontend performance tracking.
