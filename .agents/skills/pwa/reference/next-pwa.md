# @ducanh2912/next-pwa

The `@ducanh2912/next-pwa` plugin integrates PWA capabilities into Next.js via Workbox. This is the successor to the original `next-pwa` by shadowwalker. For new projects, the author recommends using [Serwist](https://serwist.pages.dev) instead.

## Installation

```bash
npm i @ducanh2912/next-pwa && npm i -D webpack
```

**Note:** Requires webpack. Not compatible with Turbopack-only setups.

## Basic setup (3 steps)

### Step 1: Wrap Next.js config with `withPWA`

```js
// next.config.js
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

module.exports = withPWA({
  // Your Next.js config
});
```

After `next build`, generates two files in `public/`:
- `workbox-*.js` — Workbox runtime
- `sw.js` — Service worker

### Prod-only install (reduce production dependencies)

```js
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require("next/constants");

/** @type {import("next").NextConfig} */
const nextConfig = { reactStrictMode: true };

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withPWA = require("@ducanh2912/next-pwa").default({ dest: "public" });
    return withPWA(nextConfig);
  }
  return nextConfig;
};
```

### Step 2: Add web app manifest

**App Router** — `app/manifest.json` or `app/manifest.ts`:
```json
{
  "name": "My PWA App",
  "short_name": "PWA App",
  "icons": [
    { "src": "/icons/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/android-chrome-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#FFFFFF",
  "background_color": "#FFFFFF",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait"
}
```

**Pages Router** — `public/manifest.json` (same content).

### Step 3: Add metadata to layout

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from "next";

const APP_NAME = "PWA App";
const APP_DEFAULT_TITLE = "My Awesome PWA App";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Best PWA app!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
```

## Configuration options

```js
const withPWA = require("@ducanh2912/next-pwa").default({
  // Output directory for service worker (relative to Next.js root)
  dest: "public",

  // Disable PWA (e.g., in dev)
  // disable: process.env.NODE_ENV === "development",

  // Service worker filename
  sw: "sw.js",   // default

  // Auto-register service worker. Set false for manual registration.
  register: true,

  // URL scope for PWA (defaults to basePath)
  scope: "/",

  // Cache start URL
  cacheStartUrl: true,
  // Dynamic start URL (different HTML for logged-in vs. not)
  // dynamicStartUrl: true,
  // Redirect target for start URL (e.g., "/login")
  // dynamicStartUrlRedirect: "/login",

  // Cache on front-end navigation
  cacheOnFrontendNav: false,
  // Aggressively cache CSS/JS on frontend nav
  // aggressiveFrontEndNavCaching: true,

  // Reload app when back online
  reloadOnOnline: true,

  // Extend default runtime caching (only when runtimeCaching is provided)
  extendDefaultRuntimeCaching: false,

  // Custom worker config
  // customWorkerSrc: "worker",      // source directory (default: "worker")
  // customWorkerDest: "public",     // output directory (default: dest)
  // customWorkerPrefix: "worker",   // output filename prefix

  // Exclude files in public/ from precaching
  publicExcludes: ["!noprecache/**/*"],

  // Offline fallbacks
  fallbacks: {
    document: "/~offline",    // failed page requests
    data: "/fallback.json",   // /_next/.../.json files
    image: "/fallback.webp",
    audio: "/fallback.mp3",
    video: "/fallback.mp4",
    font: "/fallback-font.woff2",
  },

  // Workbox options (passed directly to workbox-webpack-plugin)
  workboxOptions: {
    // exclude: [/\.map$/, /^manifest.*\.js$/],
    // runtimeCaching: [...],
    // ...
  },
});
```

## Runtime caching

`next-pwa` provides default caching strategies. To add custom ones:

```js
const withPWA = require("@ducanh2912/next-pwa").default({
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.example\.com\/.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
        },
      },
    ],
  },
});
```

### Built-in caching strategies
- HTML requests: `NetworkFirst`
- RSC requests: `NetworkFirst`
- RSC precaches: `NetworkFirst`
- JS/CSS: `CacheFirst` (precached)
- Images: `StaleWhileRevalidate`
- Fonts: `CacheFirst`

## Offline fallbacks

### Pages
**App Router**: Create `app/~offline/page.tsx`
**Pages Router**: Create `pages/_offline.tsx`

This page is automatically used when the user is offline and no cached page exists.

### Assets
Configure `fallbacks` object (see options above) for images, fonts, audio, video, data.

## Custom worker

Inject custom code into the generated service worker:

```js
// worker/index.ts (default path)
// This code will be bundled into dest/worker-*.js
// and imported by the service worker

// Example: custom caching logic
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
```

Change paths:
```js
const withPWA = require("@ducanh2912/next-pwa").default({
  customWorkerSrc: "service-worker",
  customWorkerDest: "public",
  customWorkerPrefix: "custom",
});
// Looks for: service-worker/index.{js,ts}
// Outputs to: public/custom-*.js
```

**Important**: Do not use custom worker for critical code. Service workers are an enhancement, not critical infrastructure.

## Precaching

### Default behavior
- All JS files are precached (can be too much for large apps)
- Default excludes: fonts from `next/font`, `.map` files, `.manifest.*.js` files

### Custom exclusion
```js
const withPWA = require("@ducanh2912/next-pwa").default({
  workboxOptions: {
    exclude: [/\.map$/, /^manifest.*\.js$/, /some-heavy-chunk\.js$/],
  },
});
```

## Dev mode behavior
- Service worker sets all resources to **network-only** in development
- If app reloads infinitely in dev: unregister any existing production service worker from browser DevTools → Application → Service Workers

## Migration to Serwist

The author recommends [Serwist](https://serwist.pages.dev) for new projects. Key differences:
- `@serwist/next` replaces `@ducanh2912/next-pwa`
- `@serwist/webpack-plugin` replaces underlying workbox
- Better TypeScript support
- More modern architecture
