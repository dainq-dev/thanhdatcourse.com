# Configuration Reference (`next.config.js`)

## Core settings

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output mode
  output: undefined,           // 'standalone' | 'export'
  
  // Base path prefix
  basePath: '',                // e.g. '/docs'
  
  // Asset prefix for CDN
  assetPrefix: '',             // e.g. 'https://cdn.example.com'
  
  // Trailing slash on URLs
  trailingSlash: false,
  
  // Compression (gzip)
  compress: true,
  
  // Build directory
  distDir: '.next',
  
  // React strict mode
  reactStrictMode: true,
  
  // React Compiler (auto-optimize)
  reactCompiler: false,        // boolean | { compilationMode: 'infer' }
  
  // React max headers length
  reactMaxHeadersLength: 6000,
  
  // Page extensions (Pages Router)
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Custom build ID
  generateBuildId: () => null,
  
  // ETags
  generateEtags: true,
  
  // App Router enabled
  appDir: true,
  
  // X-Powered-By header
  poweredByHeader: true,
  
  // Production source maps
  productionBrowserSourceMaps: false,
  
  // Environment variables (build time, public)
  env: {},

  // CrossOrigin attribute for scripts
  crossOrigin: undefined,     // 'anonymous' | 'use-credentials'
  
  // Deployment ID for cache busting
  deploymentId: undefined,
  
  // Typed routes
  typedRoutes: false,
  
  // Allowed dev origins (CORS)
  allowedDevOrigins: ['localhost'],
  
  // Typescript error handling
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },
  
  // Auth interrupts (for forbidden/unauthorized)
  authInterrupts: false,
  
  // Cache Components
  cacheComponents: false,
  
  // URL imports
  urlImports: undefined,
  
  // View transitions
  viewTransition: false,
  
  // HTML limited bots
  htmlLimitedBots: undefined,
  
  // Proxy max body size
  proxyClientMaxBodySize: '1mb',
  
  // Transpile packages
  transpilePackages: [],
  
  // Server external packages (not bundled)
  serverExternalPackages: [],
  
  // Optimize package imports
  optimizePackageImports: [],
  
  // Server Components HMR cache
  serverComponentsHmrCache: true,
  
  // Use Lightning CSS
  useLightningcss: false,
  
  // CSS Chunking
  cssChunking: false,
  
  // Inline CSS threshold
  inlineCss: false,
  
  // MDX with Rust compiler
  mdxRs: false,
}
```

## Cache configuration

```js
const nextConfig = {
  // Cache Components model
  cacheComponents: false,     // enable Cache Components

  // Cache handlers for "use cache: remote"
  cacheHandlers: {
    default: '...',
    remote: '...',
  },
  
  // Cache life profiles
  cacheLife: {
    hours: { stale: 300, revalidate: 3600, expire: 86400 },
    days: { stale: 300, revalidate: 86400, expire: 604800 },
  },
  
  // ISR expire time
  expireTime: 3600,

  // Static generation
  staticGeneration: {
    excludeDefaultCacheControl: false,
  },
  
  // Stale times (client-side router cache)
  staleTimes: {
    dynamic: 0,
    static: 300,
  },
  
  // Incremental cache handler path (previous model)
  cacheHandler: undefined,
  
  // Taint (experimental)
  taint: false,
}
```

## Headers, Redirects, Rewrites

```js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Custom', value: 'header' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
  
  async redirects() {
    return [
      {
        source: '/old/:path*',
        destination: '/new/:path*',
        permanent: true,  // 308
      },
    ]
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ]
  },
}
```

## Image optimization

```js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/images/**',
      },
    ],
    domains: [],                    // deprecated, use remotePatterns
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],       // also 'image/avif'
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',             // 'default' | 'custom' | 'imgix' | 'cloudinary' | 'akamai' | 'cloudflare'
    loaderFile: undefined,
  },
}
```

## Server Actions

```js
const nextConfig = {
  serverActions: {
    allowedOrigins: ['localhost:3000'],
    bodySizeLimit: '1mb',
  },
}
```

## Sass options

```js
const nextConfig = {
  sassOptions: {
    includePaths: ['./styles'],
    prependData: `$primary: #333;`,
  },
}
```

## Webpack customization

```js
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({ /* ... */ })
    return config
  },
}
```

## Turbopack

```js
const nextConfig = {
  turbopack: {
    fileSystemCache: {
      directory: '.turbopack-cache',
    },
    ignoreIssue: (issue) => {
      return issue.severity === 'warning'
    },
    localPostcssConfig: false,
  },
}
```

## Misc

```js
const nextConfig = {
  httpAgentOptions: { keepAlive: true },
  onDemandEntries: {
    maxInactiveAge: 60_000,
    pagesBufferLength: 5,
  },
  exportPathMap: async () => ({}),  // Pages Router static export
  logging: {
    fetches: { fullUrl: false },
    incomingRequests: false,
    browserConsole: false,
  },
  devIndicators: {
    buildActivity: true,
    position: 'bottom-left',  // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  },
  webVitalsAttribution: ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'],
  exportPathMap: async () => ({}),
  adapterPath: undefined,
}
```

## Environment variable files (priority order)
1. `.env.local` — local overrides (not committed)
2. `.env.development` / `.env.production`
3. `.env` — default values

Prefix with `NEXT_PUBLIC_` to expose to browser.
