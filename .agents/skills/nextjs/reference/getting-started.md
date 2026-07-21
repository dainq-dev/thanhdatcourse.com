# Getting Started with Next.js 16.2

## Project Structure

### Top-level folders
- `app/` — App Router (file-system routing)
- `pages/` — Pages Router (legacy)
- `public/` — Static assets served at `/`
- `src/` — Optional app source folder

### Routing files (in `app/`)
- `layout.js` — Shared wrapper, preserves state, must contain `<html>`/`<body>` at root
- `page.js` — Makes a route publicly accessible
- `loading.js` — Suspense fallback UI
- `error.js` — Error boundary (catches errors in children)
- `global-error.js` — Root error boundary
- `not-found.js` — 404 UI
- `forbidden.js` — 403 (authInterrupts required)
- `unauthorized.js` — 401 (authInterrupts required)
- `route.js` — API route handler
- `template.js` — Like layout but re-renders every navigation
- `default.js` — Fallback for parallel routes

### Component hierarchy (render order)
1. `layout.js`
2. `template.js`
3. `error.js` (ErrorBoundary)
4. `loading.js` (Suspense)
5. `not-found.js` (404 boundary)
6. `page.js` or nested `layout.js`

### Nested routes
Folders map to URL segments. A route is public only with a `page.js` or `route.js`.
```
app/layout.tsx          → wraps everything
app/page.tsx            → /
app/blog/layout.tsx     → wraps /blog/*
app/blog/page.tsx       → /blog
app/blog/[slug]/page.tsx → /blog/:slug
```

### Dynamic routes
- `[param]` — single dynamic segment
- `[...param]` — catch-all
- `[[...param]]` — optional catch-all
- Access via `params` prop (now a Promise in v16): `const { slug } = await params`

### Route groups and private folders
- `(groupName)` — organizational, excluded from URL
- `_folderName` — private, excluded from routing
- `%5Fprefix` — URL-encoded underscore for actual underscore in URL

### Parallel & Intercepting Routes
- `@slot` — named slot rendered by parent layout
- `(.)folder` — intercept same level
- `(..)folder` — intercept parent level
- `(...)folder` — intercept from root

### Typed route helpers (global, no import)
```tsx
// page.tsx
export default function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
}

// layout.tsx
export default function Layout(props: LayoutProps<'/dashboard'>) {
  return <section>{props.children}{props.analytics}</section>
}
```

## Layouts & Pages

### Root layout (required)
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Linking
```tsx
import Link from 'next/link'
<Link href={`/blog/${post.slug}`}>{post.title}</Link>
```
- Primary navigation method
- Automatic prefetching with viewport-based priority
- Use `useRouter()` for programmatic navigation
- `Link` extends `<a>` with prefetching + client-side transitions

### Installation
```bash
npx create-next-app@latest my-app
# Recommended defaults: TypeScript, ESLint, Tailwind CSS, App Router, AGENTS.md, Turbopack
```
- Minimum Node.js: 20.9
- Supports Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+
- Scripts: `next dev`, `next build`, `next start`
