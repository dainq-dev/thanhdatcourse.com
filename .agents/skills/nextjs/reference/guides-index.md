# Guides Index

Progressive disclosure: each guide is summarized with when to apply.

## AI Coding Agents
Configure AGENTS.md so coding agents use up-to-date Next.js docs.
**When**: Setting up a project for AI-assisted development.

## Analytics
Measure page performance with Next.js Speed Insights.
**When**: Adding Web Vitals tracking, performance monitoring.

## Authentication
Implement auth patterns (middleware, Server Components, route handlers).
**When**: Adding login, sessions, protected routes, auth-based redirects.

## Backend for Frontend (BFF)
Use Next.js as a backend API layer.
**When**: Building API aggregation, data transformation between frontend and microservices.

## Caching (Previous Model)
Using `fetch` options, `unstable_cache`, and route segment configs.
**When**: Working with projects that don't use Cache Components.
→ See [caching-legacy.md](caching-legacy.md)

## CDN Caching
How CDN caching works with Next.js pathname-based cache keying.
**When**: Configuring CDN, optimizing cache hit rates, understanding cache variability.

## CI Build Caching
Configure CI to cache Next.js builds for faster pipeline execution.
**When**: Setting up CI/CD, reducing build times in GitHub Actions, etc.

## Content Security Policy (CSP)
Set CSP headers for Next.js applications.
**When**: Adding security headers, preventing XSS attacks.

## CSS-in-JS
Use CSS-in-JS libraries with server rendering support in Next.js.
**When**: Using styled-components, emotion, or other CSS-in-JS libraries.

## Custom Server
Start Next.js programmatically with a custom Node.js server.
**When**: Integrating with existing server infrastructure, custom routing, WebSocket support.

## Data Security
Built-in security features and best practices.
**When**: Protecting data, preventing leaks between requests, using `taint` for sensitive data.

## Debugging
Debug with VS Code, Chrome DevTools, or Firefox DevTools.
**When**: Setting up debugging, troubleshooting rendering issues.

## Deploying to Platforms
Understand which features require specific platform capabilities.
**When**: Choosing a deployment target, understanding platform compatibility.

## Draft Mode
Toggle between static and dynamic rendering for content preview.
**When**: Implementing CMS preview, draft content before publishing.

## Environment Variables
Add and access environment variables at build and runtime.
**When**: Configuring secrets, API keys, per-environment settings.
→ Prefix: `NEXT_PUBLIC_` for browser, otherwise server-only.
→ File priority: `.env.local` > `.env.[mode]` > `.env`

## Forms
Create forms with React Server Actions.
**When**: Building form submissions, validation, file uploads.
→ Use `action` prop on `<form>` pointing to a Server Action.
→ Use `<Form>` component from `next/form` for search param updates.

## How Revalidation Works
Deep dive into tag system, cache consistency, multi-instance coordination.
**When**: Debugging stale data, understanding revalidation internals.

## ISR (Incremental Static Regeneration)
Create or update static pages at runtime.
**When**: Static content that needs periodic updates without full rebuild.
→ `export const revalidate = 3600`

## Instrumentation
Run code at server startup for OpenTelemetry, logging, etc.
**When**: Setting up monitoring, tracing, custom server startup logic.
→ File: `instrumentation.ts` at project root with `register()` export.

## Internationalization (i18n)
Multi-language support with routing and localized content.
**When**: Building multi-language sites, locale-based routing, translations.

## JSON-LD
Add structured data via JSON-LD for search engines and AI.
**When**: Adding rich results, knowledge graph data, SEO enhancements.

## Lazy Loading
Lazy load libraries and components to improve performance.
**When**: Large components, heavy libraries, above-the-fold optimization.

## Development Environment
Optimize local development experience.
**When**: Configuring dev server, Fast Refresh, Turbopack settings.

## MDX
Markdown with JSX components.
**When**: Building content sites, documentation, blogs with interactive components.
→ File: `mdx-components.js` at app root to customize MDX rendering.

## Memory Usage
Optimize memory in development and production.
**When**: Debugging high memory usage, optimizing large applications.

## Multi-tenant
Build apps serving multiple tenants from a single codebase.
**When**: SaaS applications, white-label solutions, tenant-specific data isolation.

## Multi-zones
Micro-frontends: deploy multiple Next.js apps under one domain.
**When**: Team autonomy, incremental migration, combining separate apps.

## OpenTelemetry
Instrument your app with OpenTelemetry for observability.
**When**: Distributed tracing, performance monitoring, production debugging.

## Package Bundling
Analyze and optimize server and client bundles.
**When**: Reducing bundle size, analyzing dependencies, optimizing imports.

## PPR Platform Guide
Implement Partial Prerendering support for platforms.
**When**: Building deployment platforms that support PPR.

## Prefetching
Configure how Next.js prefetches routes.
**When**: Optimizing navigation speed, controlling prefetch behavior.

## Preserving UI State
Control state preservation across navigations.
**When**: Keeping scroll position, form state, or component state during navigation.

## Preventing Flash
Avoid visible flash during hydration.
**When**: Dark mode theming, locale detection, any client-side correction of server HTML.

## Production Checklist
Recommendations before going to production.
→ Essential: test prod build, configure caching, set env vars, add error boundaries.

## PWAs
Build Progressive Web Apps.
**When**: Offline support, installable apps, service workers, manifest.

## Public Pages
Build static pages that share data across users.
**When**: Landing pages, product listings, blog feeds, marketing sites.

## Redirecting
All redirect methods in Next.js.
→ `redirect()` (307), `permanentRedirect()` (308), `next.config.js` redirects, middleware redirects.

## Rendering Philosophy
How Next.js treats static/dynamic as a spectrum at component level.
**When**: Understanding rendering strategies, choosing between static/dynamic/streaming.

## Sass
Style with Sass/SCSS.
**When**: Using Sass variables, mixins, nested CSS.

## Scripts
Optimize third-party scripts with `<Script>` component.
**When**: Adding analytics, chatbots, ads, or any external script.

## Self-Hosting
Self-host on Node.js, Docker, or static files.
→ See [deployment.md](deployment.md)

## SPAs
Build Single Page Applications.
**When**: Client-rendered apps, migrating from CRA/Vite.

## Static Exports
Export as static HTML/CSS/JS.
**When**: Hosting on CDN, no server required, static sites.

## Streaming
Progressively render UI as data becomes available.
**When**: Reducing TTFB, large pages with async data.

## Tailwind CSS v3
Configure Tailwind CSS v3 for broader browser support.

## Testing
- **Cypress**: E2E and Component Testing
- **Jest**: Unit and Snapshot Testing (with `@swc/jest` for speed)
- **Playwright**: End-to-End Testing (recommended for Next.js)
- **Vitest**: Unit Testing (fast, native ESM support)

## Third Party Libraries
Optimize with `@next/third-parties` package.

## Videos
Optimize video delivery in Next.js.

## View Transitions
Smooth page transitions with View Transition API.
→ Enable: `viewTransition: true` in `next.config.js`
