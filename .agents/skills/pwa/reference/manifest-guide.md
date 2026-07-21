# Web App Manifest Guide

The web app manifest is a JSON file that controls how your app appears on the user's home screen and how it launches.

## File location

| Router | Path | Type |
|--------|------|------|
| App Router | `app/manifest.json` | Static |
| App Router | `app/manifest.ts` | Dynamic (generated) |
| Pages Router | `public/manifest.json` | Static |

Reference in layout:
```tsx
export const metadata: Metadata = {
  manifest: '/manifest.json',
}
```

## Required fields

```json
{
  "name": "Full App Name",
  "short_name": "Short Name",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## All fields

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Full app name (max 45 chars recommended) | Yes |
| `short_name` | Short name for home screen (max 12 chars) | Yes |
| `start_url` | URL opened when app launches | Yes |
| `display` | `fullscreen`, `standalone`, `minimal-ui`, `browser` | Yes |
| `icons` | Array of icon objects | Yes |
| `description` | App description | No |
| `theme_color` | Toolbar/task switcher color | Recommended |
| `background_color` | Splash screen background | Recommended |
| `scope` | Navigation scope (default: from start_url) | No |
| `orientation` | `portrait`, `landscape`, `any` | No |
| `id` | Unique identifier for the app | No |
| `lang` | Primary language | No |
| `dir` | Text direction: `ltr`, `rtl`, `auto` | No |
| `categories` | App categories for stores | No |
| `screenshots` | Screenshots for install prompts | No |
| `shortcuts` | Quick actions on long-press | No |
| `related_applications` | Native app equivalents | No |
| `prefer_related_applications` | Hint to prefer native app | No |
| `protocol_handlers` | Custom URL protocol handlers | No |

## Icons

### Required sizes
At minimum: **192×192** and **512×512**

### Recommended sizes
`72×72`, `96×96`, `128×128`, `144×144`, `152×152`, `192×192`, `384×384`, `512×512`

### Icon object
```json
{
  "src": "/icons/icon-192.png",
  "sizes": "192x192",
  "type": "image/png",
  "purpose": "any maskable"
}
```

- `purpose`: `"any"` (default), `"maskable"` (safe zone for cropped shapes), or `"any maskable"` (both)
- Use PNG format for best compatibility
- `maskable` icons need a safe zone (80% of icon center should be visible)

### Tools
Use [realfavicongenerator.net](https://realfavicongenerator.net/) to generate all icon sizes and formats.

## Display modes

| Mode | Behavior |
|------|----------|
| `standalone` | Looks like native app. No browser UI. (recommended) |
| `fullscreen` | No status bar. Full device screen. |
| `minimal-ui` | Minimal browser controls shown. |
| `browser` | Normal browser tab. |

## iOS-specific (Apple meta tags)

Add in layout metadata:
```tsx
export const metadata: Metadata = {
  appleWebApp: {
    capable: true,              // enables standalone mode
    title: 'My App',            // app name on home screen
    statusBarStyle: 'default',  // 'default' | 'black' | 'black-translucent'
    startupImage: [             // splash screen images
      {
        url: '/splashscreens/iphone5_splash.png',
        media: '(device-width: 320px) and (device-height: 568px)',
      },
    ],
  },
}
```

HTML equivalents (if not using Metadata API):
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="My App" />
<link rel="apple-touch-icon" href="/apple-icon.png" />
```

## Dynamic manifest (Next.js App Router)

```ts
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My App',
    short_name: 'App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

## Testing

Chrome DevTools → Application → Manifest:
- Shows parsed manifest
- Lists installability requirements
- Shows any errors or warnings

Lighthouse PWA audit checks manifest validity.

## Best practices

1. Always include both `name` and `short_name`
2. Use `display: standalone` for app-like experience
3. Provide at least 192×192 and 512×512 icons
4. Include `maskable` icon purpose for Android adaptive icons
5. Set `theme_color` to match your brand
6. Set `background_color` for splash screen
7. Add `appleWebApp.capable: true` for iOS support
8. Test on real devices, not just DevTools
