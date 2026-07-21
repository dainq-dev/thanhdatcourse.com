# Error Handling Reference

## Error boundary (`error.js`)

```tsx
'use client' // Must be Client Component

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Key facts
- Must be a Client Component (`'use client'`)
- Catches errors in `page.js` and children components
- Does NOT catch errors in `layout.js` or `template.js` (use `global-error.js`)
- `reset()` re-attempts to render the error boundary's children
- `error.digest` is a hash of the error for server-side logging

## Global error (`global-error.js`)

Catches errors in root `layout.js` and `template.js`:
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
- Must include `<html>` and `<body>` tags (replaces root layout)
- Only shown in production; in dev, the error overlay is shown instead
- Only one `global-error.js` (at app root)

## Not Found (`not-found.js`)

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

### Triggering 404
```tsx
import { notFound } from 'next/navigation'

// In Server Component, Route Handler, or Server Action:
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()
  return <div>{post.title}</div>
}
```
- Renders the nearest `not-found.js`
- Does NOT catch the error; renders 404 page directly
- By default, Next.js has a built-in 404 page

## Forbidden (`forbidden.js`) - 403

```tsx
import { forbidden } from 'next/navigation'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user.isAdmin) forbidden()
  return <AdminPanel />
}
```
Requires `authInterrupts: true` in `next.config.js`.

## Unauthorized (`unauthorized.js`) - 401

```tsx
import { unauthorized } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) unauthorized()
  return <Profile user={user} />
}
```
Requires `authInterrupts: true` in `next.config.js`.

## Server error handling with `unstable_catchError`

```tsx
import { unstable_catchError } from 'next/navigation'

export default async function Page() {
  try {
    await fetchSomething()
  } catch (error) {
    unstable_catchError(error)
    // handle gracefully
  }
}
```

## Error re-throwing with `unstable_rethrow`

```tsx
import { unstable_rethrow } from 'next/navigation'

try {
  const post = await getPost(id)
} catch (error) {
  unstable_rethrow(error) // pass through Next.js internal errors
  // handle your app-specific errors
  console.error(error)
}
```

## Error hierarchy (render order)

```
layout.js
  template.js
    error.js          ← catches errors from page + children
      loading.js
        not-found.js  ← catches notFound()
          page.js
```

`global-error.js` wraps everything above the root layout.

## Best practices
1. Always add `error.js` at each route segment level
2. Add `global-error.js` for production error fallback
3. Use `error.digest` to match errors with server logs
4. Provide a "try again" button via `reset()`
5. Log errors to your monitoring service in `useEffect`
6. Use `unstable_rethrow` in try/catch blocks to not swallow Next.js internal errors
7. Use `forbidden()` / `unauthorized()` instead of generic redirects for auth errors
