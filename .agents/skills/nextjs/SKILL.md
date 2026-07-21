---
name: nextjs
description: Expert guidance for Next.js 16.2 App Router. Use when building, debugging, or explaining Next.js applications including routing, data fetching, caching, server/client components, metadata, API routes, middleware, configuration, deployment, and optimization. Covers all file conventions, functions, components, and best practices.
---

# Next.js 16.2 App Router

Reference for Next.js v16.2.9 App Router. Covers project structure, routing, data fetching, server/client components, caching, error handling, optimization, API routes, configuration, and deployment.

## When to apply this skill

Apply when the task involves:
- Creating or modifying Next.js routes, layouts, or pages
- Deciding between Server vs Client Components
- Fetching, caching, or mutating data
- Configuring `next.config.js`
- Using Next.js built-in functions (`cookies`, `headers`, `redirect`, `revalidatePath`, etc.)
- Setting up metadata, OG images, sitemaps
- Optimizing images, fonts, or scripts
- Error handling with `error.js`, `not-found.js`, `forbidden.js`
- Route handlers (`route.js`) or proxy
- Middleware, environment variables, authentication
- Deployment, static exports, self-hosting
- Testing, internationalization, MDX

## Quick decision rules

### Server vs Client Components

- **Server Component** (default): Fetch data directly, access backend resources, keep large deps on server. No `use client` directive.
- **Client Component**: Use `use client` only when you need interactivity (event handlers, state, effects), browser APIs, or hooks like `useRouter`/`usePathname`/`useSearchParams`.

### `searchParams` prop vs `useSearchParams` hook

- Use `searchParams` **prop** (Server Component page): Need search params to load data (pagination, filtering from DB).
- Use `useSearchParams` **hook** (Client Component): Search params needed only on client (filtering already-loaded data).

### Static vs Dynamic Rendering

- Using `searchParams`, `cookies()`, `headers()`, or `connection()` → **Dynamic Rendering**
- Using `generateStaticParams` → **Static Generation** (SSG)
- Using `export const dynamic = 'force-static'` → force static
- Using `export const dynamic = 'force-dynamic'` → force dynamic

## File conventions quick reference

| File | Purpose |
|------|---------|
| `layout.js` | Shared UI wrapper, preserves state across navigation |
| `page.js` | Public route UI |
| `loading.js` | Suspense fallback, shows while page loads |
| `error.js` | Error boundary for segment |
| `global-error.js` | Root error boundary (must include `<html>`/`<body>`) |
| `not-found.js` | 404 UI |
| `forbidden.js` | 403 UI (requires `authInterrupts` config) |
| `unauthorized.js` | 401 UI (requires `authInterrupts` config) |
| `route.js` | API endpoint |
| `template.js` | Like layout but re-renders on every navigation |
| `default.js` | Fallback for parallel routes |
| `proxy.js` | Request proxy handler |
| `instrumentation.ts` | Server startup hooks (OTel) |
| `instrumentation-client.js` | Client-side instrumentation |

### Dynamic routes
- `[slug]` — single param
- `[...slug]` — catch-all
- `[[...slug]]` — optional catch-all
- `(group)` — route group (excluded from URL)
- `_folder` — private folder (excluded from routing)
- `@slot` — parallel route slot
- `(.)folder`, `(..)folder`, `(...)folder` — intercepting routes

## Key functions and hooks

For detailed signatures and usage, see [reference/api-functions.md](reference/api-functions.md).

### Frequently used
- `cookies()`, `headers()` — read request info (dynamic rendering)
- `redirect(url)` — 307 temporary redirect
- `permanentRedirect(url)` — 308 permanent redirect
- `notFound()` — trigger 404
- `forbidden()`, `unauthorized()` — auth errors
- `revalidatePath(path)` — on-demand revalidation by path
- `revalidateTag(tag)` — on-demand revalidation by cache tag
- `draftMode()` — toggle draft/preview mode
- `connection()` — access to `await connection()`

### Client hooks
- `useRouter()` — programmatic navigation
- `usePathname()` — current URL pathname
- `useSearchParams()` — URL search params (client)
- `useParams()` — route params
- `useLinkStatus()` — link loading state
- `useReportWebVitals()` — Web Vitals reporting
- `useSelectedLayoutSegment(s)` — active segment

### Cache management (v16.2+ Cache Components model)
- `use cache` — Cache Components directive
- `cacheLife(name)` — set cache expiration profile
- `cacheTag(tag)` — tag cached data for revalidation
- `updateTag(tag, revalidate)` — update cached data
- `refresh()` — refresh route from server
- `unstable_cache(fn, keyParts, options)` — legacy cache (previous model)
- `unstable_noStore()` — opt out of caching

## Caching model

Next.js 16.2 uses **Cache Components** (`use cache`). The previous model (`unstable_cache`, route segment configs) is documented at [reference/caching-legacy.md](reference/caching-legacy.md).

- `"use cache"` — caches a function or component
- `"use cache: private"` — per-request cache (accesses runtime APIs)
- `"use cache: remote"` — persistent shared cache across instances
- Configure cache profiles in `next.config.js` → `cacheLife`
- Tag with `cacheTag()` for targeted `revalidateTag()` invalidation
- `staleTimes` config controls client-side router cache

## Fetching data

See [reference/data-fetching.md](reference/data-fetching.md).

Server Components can directly use `async/await`:
```tsx
export default async function Page() {
  const data = await fetch('https://api.example.com')
  const posts = await data.json()
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

For mutations, use **Server Functions** with `"use server"`:
```tsx
'use server'
export async function createPost(formData: FormData) {
  // ...
}
```

## Reference files

Progressive disclosure — load only what the task requires:

- **[getting-started.md](reference/getting-started.md)**: Project structure, layouts, pages, linking, component hierarchy
- **[data-fetching.md](reference/data-fetching.md)**: Fetching, mutating (Server Actions), caching, revalidating patterns
- **[routing.md](reference/routing.md)**: Dynamic routes, parallel routes, intercepting routes, route groups, middleware
- **[file-conventions.md](reference/file-conventions.md)**: All special files with signatures and usage
- **[api-functions.md](reference/api-functions.md)**: Complete reference for all functions and hooks
- **[configuration.md](reference/configuration.md)**: All `next.config.js` options with defaults
- **[metadata.md](reference/metadata.md)**: Metadata API, OG images, sitemaps, robots, icons
- **[optimization.md](reference/optimization.md)**: Images, fonts, scripts, lazy loading, videos
- **[error-handling.md](reference/error-handling.md)**: Error boundaries, not-found, forbidden, unauthorized
- **[caching-legacy.md](reference/caching-legacy.md)**: Previous caching model (for projects not using Cache Components)
- **[deployment.md](reference/deployment.md)**: Self-hosting, static exports, Docker, adapters
- **[guides-index.md](reference/guides-index.md)**: Index of all guides with when to use each
