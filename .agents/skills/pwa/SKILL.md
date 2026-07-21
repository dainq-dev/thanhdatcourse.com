---
name: pwa
description: Build Progressive Web Applications with Next.js or React. Use when implementing offline support, service workers, web app manifest, push notifications, install prompts, precaching, runtime caching strategies, or configuring @ducanh2912/next-pwa. Covers next-pwa plugin, native Next.js PWA, manifest.json, workbox, and CRA PWA migration.
---

# Progressive Web Applications (PWA)

Guidance for building PWAs with Next.js and React. Covers the `@ducanh2912/next-pwa` plugin, native Next.js PWA approach, web app manifests, service workers, push notifications, offline support, and caching strategies.

## When to apply this skill

Apply when the task involves:
- Making a Next.js app installable (PWA)
- Adding offline support / service workers
- Configuring `@ducanh2912/next-pwa` plugin
- Creating a web app manifest (`manifest.json` / `manifest.ts`)
- Implementing push notifications with Web Push API + VAPID
- Setting up precaching and runtime caching for assets
- Adding install prompts or handling `beforeinstallprompt`
- Debugging service worker lifecycle issues
- Migrating CRA PWA to Next.js
- Adding offline fallback pages

## Quick decision: which approach?

| Approach | When to use |
|----------|-------------|
| **`@ducanh2912/next-pwa`** | Next.js projects needing full PWA: precaching, runtime caching, offline fallbacks, custom workers. Quickest setup. |
| **Native Next.js PWA** | Only need manifest + push notifications. No offline caching needed, or handling offline separately. No webpack dependency. |
| **Serwist (`@serwist/next`)** | Modern alternative to next-pwa. Recommended by next-pwa author for new projects. |
| **CRA PWA** | Legacy Create React App projects only. Deprecated. |

## Core PWA checklist

A full PWA requires these building blocks:

1. **Web App Manifest** — `manifest.json` or `manifest.ts` with name, icons, display, theme_color
2. **HTTPS** — required for service workers (except localhost)
3. **Service Worker** — handles caching, offline, push events
4. **Icons** — at minimum 192×192 and 512×512 PNG icons
5. **iOS meta tags** — `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
6. **Offline strategy** — precaching for shell, runtime caching for data

## Required elements for installability

- Valid web app manifest
- Registered service worker with fetch handler
- Served over HTTPS
- Icons at least 192×192 and 512×512
- `display: standalone` or `display: fullscreen`

## Reference files

Progressive disclosure — load only what the task requires:

- **[next-pwa.md](reference/next-pwa.md)**: `@ducanh2912/next-pwa` plugin — installation, configuration, all options, runtime caching, custom workers, offline fallbacks, precaching
- **[native-pwa.md](reference/native-pwa.md)**: Native Next.js PWA without plugins — manifest, push notifications, service worker, VAPID keys, install prompt, security headers
- **[manifest-guide.md](reference/manifest-guide.md)**: Web app manifest deep dive — all fields, icons, iOS meta tags, best practices
- **[service-worker-patterns.md](reference/service-worker-patterns.md)**: Service worker patterns — lifecycle, caching strategies, workbox, precaching, runtime caching, debugging
- **[push-notifications.md](reference/push-notifications.md)**: Web push notifications — VAPID, web-push, subscription flow, service worker events
