# Optimization: Images, Fonts, Scripts, Loading

## Image Optimization (`next/image`)

```tsx
import Image from 'next/image'

// Local image (auto width/height, blur placeholder)
<Image src="/profile.png" alt="Profile" width={100} height={100} priority />

// Remote image (requires config in next.config.js)
<Image
  src="https://example.com/image.jpg"
  alt="Remote"
  width={800}
  height={600}
/>

// Fill mode (fills parent container)
<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <Image src="/hero.jpg" alt="Hero" fill className="object-cover" priority />
</div>
```

### Image props
- `priority` — load eagerly (LCP images)
- `placeholder="blur"` | `"empty"` — blur-up placeholder
- `sizes="(max-width: 768px) 100vw, 50vw"` — responsive sizes
- `quality={75}` — compression quality (1-100)
- `unoptimized={true}` — skip optimization for static exports
- `loader` — custom loader function

### Image config (`next.config.js`)
```js
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'example.com' }],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

## Font Optimization (`next/font`)

### Google Fonts
```tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Local Fonts
```tsx
import localFont from 'next/font/local'

const myFont = localFont({
  src: './my-font.woff2',
  display: 'swap',
  variable: '--font-my',
})
```

### In Tailwind CSS
```ts
// tailwind.config.ts
extend: { fontFamily: { sans: ['var(--font-inter)'] } }
```

## Script Optimization (`next/script`)

```tsx
import Script from 'next/script'

// Default (loaded after hydration)
<Script src="https://example.com/script.js" />

// Before page interactive (critical scripts)
<Script src="..." strategy="beforeInteractive" />

// After page interactive (non-critical)
<Script src="..." strategy="afterInteractive" />

// Lazy load (when browser idle)
<Script src="..." strategy="lazyOnload" />

// Worker (off main thread)
<Script src="..." strategy="worker" />

// Inline scripts
<Script id="inline">
  {`console.log('inline')`}
</Script>

// On callbacks
<Script
  src="..."
  onLoad={() => console.log('loaded')}
  onError={(e) => console.error('failed', e)}
/>
```

## Lazy Loading

### Dynamic imports
```tsx
import dynamic from 'next/dynamic'

// Basic lazy load
const HeavyComponent = dynamic(() => import('@/components/Heavy'))

// With loading fallback
const LazyComponent = dynamic(() => import('@/components/Lazy'), {
  loading: () => <p>Loading...</p>,
  ssr: true,  // false for client-only
})

// Named exports
const { Named } = dynamic(() => import('@/components/Module').then(mod => ({ default: mod.Named })))
```

### `next/dynamic` vs `React.lazy`
Use `next/dynamic` in Next.js (handles SSR + suspense properly).

## Videos

For `<video>` elements, use `priority` on `<Image>` for poster images.
Use `<video>` with `preload="metadata"` and `muted autoPlay loop playsInline`.
Consider using a video hosting service for large files.

## Streaming

Use React Suspense for streaming server-rendered content:
```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

Content is streamed as it becomes available, reducing TTFB.

## View Transitions

Enable in `next.config.js`:
```js
viewTransition: true
```

Uses the View Transition API for smooth page transitions. Can be per-link or page-level.

## Preventing Flash
Use `suppressHydrationWarning` on `<html>` and `<body>` to avoid flash during hydration.

## Web Vitals
```tsx
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)
    // send to analytics
  })
}
```

## Preserving UI State
React's Activity component preserves state across navigations. Layouts are not re-rendered. `template.js` resets state.

## `<Form>` component
```tsx
import Form from 'next/form'

export default function Search() {
  return (
    <Form action="/search">
      <input name="q" />
      <button type="submit">Search</button>
    </Form>
  )
}
```
Handles form submissions with client-side navigation and search params.
