# Service Worker Patterns

## Service worker lifecycle

```
install → waiting → activate → fetch/message → redundant
```

1. **Install**: Browser downloads and installs the SW. Good time to precache assets.
2. **Waiting**: New SW waits for old SW to release control (all tabs closed or `skipWaiting()` called).
3. **Activate**: New SW takes control. Clean up old caches.
4. **Fetch/Message**: SW intercepts network requests and receives messages.
5. **Redundant**: SW is being replaced or fails.

### Service worker update flow
- Browser checks for SW update on navigation (every ~24h max)
- If SW file differs by even 1 byte, new SW is installed
- Old SW continues serving until all tabs close
- Use `skipWaiting()` + `clientsClaim()` for immediate updates

## Registration

### Basic registration
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none',  // always fetch from network
  })
}
```

### With update handling
```js
let refreshing = false
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return
  refreshing = true
  window.location.reload()
})

navigator.serviceWorker.register('/sw.js')
```

## Caching strategies (Workbox)

| Strategy | Behavior | Use case |
|----------|----------|----------|
| `CacheFirst` | Cache first, network fallback | Static assets (JS, CSS, fonts) |
| `NetworkFirst` | Network first, cache fallback | API responses, HTML pages |
| `StaleWhileRevalidate` | Serve cache, update in background | Images, non-critical data |
| `NetworkOnly` | Network only, no cache | Real-time data |
| `CacheOnly` | Cache only, no network | Precached assets only |

### Strategy examples (Workbox)

```js
// CacheFirst for static assets
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

registerRoute(
  /\.(?:js|css|woff2)$/,
  new CacheFirst({ cacheName: 'static-assets' })
)

// NetworkFirst for HTML navigation
import { NetworkFirst } from 'workbox-strategies'
import { NavigationRoute } from 'workbox-routing'

registerRoute(
  new NavigationRoute(
    new NetworkFirst({ cacheName: 'pages' })
  )
)

// StaleWhileRevalidate for images
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new StaleWhileRevalidate({ cacheName: 'images' })
)
```

## Precaching

Precache assets during SW install so they're available offline immediately:

```js
import { precacheAndRoute } from 'workbox-precaching'

// __WB_MANIFEST is injected by build tools
precacheAndRoute(self.__WB_MANIFEST)
```

## Manual service worker (no Workbox)

```js
// public/sw.js
const CACHE_NAME = 'my-app-v1'
const PRECACHE_URLS = ['/', '/offline.html']

// Install: precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
})

// Fetch: network first, cache fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
```

## Offline fallback pattern

```js
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return cached page or offline fallback
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/~offline')
        })
      })
    )
  }
})
```

## Background sync

```js
// Register sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts())
  }
})

// Request a sync (from page)
navigator.serviceWorker.ready.then((registration) => {
  registration.sync.register('sync-posts')
})
```

## Debugging

### Chrome DevTools
- **Application → Service Workers**: register states, unregister, force update
- **Application → Cache Storage**: inspect caches
- **Application → Manifest**: check manifest validity

### Important debugging tips
1. Always test in incognito to avoid stale SW
2. Check "Update on reload" in DevTools during development
3. Use `updateViaCache: 'none'` in registration options
4. Service worker file MUST NOT be cached (use `Cache-Control: no-cache, no-store, must-revalidate`)
5. SW only works on HTTPS or localhost

### Common issues
- **SW not updating**: Check `Cache-Control` header on `/sw.js`
- **Old content showing**: Close all tabs or implement `skipWaiting()`
- **Infinite reload**: Unregister existing production SW from DevTools
- **scope mismatch**: SW can only control pages within its scope directory
