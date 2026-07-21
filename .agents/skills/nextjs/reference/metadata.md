# Metadata, OG Images, and SEO

## Adding metadata

### Static metadata (layout or page)
```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'Description for SEO',
  metadataBase: new URL('https://example.com'),
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/en-US' },
  },
  openGraph: {
    title: 'My App',
    description: 'OG description',
    url: 'https://example.com',
    siteName: 'My App',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My App',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  keywords: ['nextjs', 'react'],
  authors: [{ name: 'Author Name' }],
  viewport: { width: 'device-width', initialScale: 1 },
  verification: {
    google: 'google-site-verification-code',
  },
  category: 'technology',
  creator: 'Creator Name',
  publisher: 'Publisher Name',
}
```

### Dynamic metadata
```tsx
export async function generateMetadata(
  { params, searchParams }: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.image] },
  }
}
```

### `generateViewport`
```tsx
export function generateViewport({ params }) {
  return {
    themeColor: '#000',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  }
}
```

## File-based metadata

### App icons (static)
```
app/
├── favicon.ico           → /favicon.ico
├── icon.png              → /icon (multiple sizes generated)
├── icon.jpg
├── apple-icon.png        → /apple-icon
```

### App icons (generated)
```
app/icon.tsx
```
```tsx
import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (<div style={{ background: 'black' }}>🔵</div>),
    { ...size }
  )
}
```

### Open Graph & Twitter images (static)
```
app/
├── opengraph-image.png   → /opengraph-image (1200×630)
├── twitter-image.png     → /twitter-image
```

### Open Graph images (generated)
```
app/opengraph-image.tsx
```
```tsx
import { ImageResponse } from 'next/og'

export const alt = 'Page title'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return new ImageResponse(
    (<div style={{ fontSize: 48 }}>{slug}</div>),
    { width: 1200, height: 630 }
  )
}
```

For multiple images per route: use `generateImageMetadata`.

### Sitemap (static XML)
```
app/sitemap.xml          → /sitemap.xml
```

### Sitemap (generated)
```
app/sitemap.ts
```
```ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://example.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://example.com/about', lastModified: new Date(), priority: 0.8 },
  ]
}
```

For large sites, use `generateSitemaps()` for multiple sitemap files.

### Robots (static)
```
app/robots.txt
```

### Robots (generated)
```
app/robots.ts
```
```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

### Manifest
```
app/manifest.json | app/manifest.ts
```
```ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My App',
    short_name: 'App',
    start_url: '/',
    display: 'standalone',
    icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }],
  }
}
```

## Metadata behavior
- Metadata merges from nested layouts outward (child overrides parent)
- `metadataBase` is required when using relative URLs in metadata
- Page metadata takes precedence over layout metadata
- `generateMetadata` replaces static `metadata` export
