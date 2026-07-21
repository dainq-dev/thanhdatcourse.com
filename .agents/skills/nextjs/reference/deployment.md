# Deployment & Self-Hosting

## Output modes

### Default (Node.js server)
```js
// next.config.js
module.exports = {
  output: undefined, // default
}
```
Run with: `next start` (after `next build`)

### Standalone (optimized for containers)
```js
module.exports = {
  output: 'standalone',
}
```
Creates self-contained `.next/standalone/` directory with minimal dependencies.
Ideal for Docker deployments.

### Static export
```js
module.exports = {
  output: 'export',
}
```
Outputs static HTML/CSS/JS to `out/`. No server required.
Cannot use: Server Components (with runtime), Server Actions, Route Handlers, `cookies()`, `headers()`, `middleware`, ISR, Draft Mode.

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

## Self-hosting on Node.js
1. `npm run build`
2. `npm run start` (runs on port 3000)
3. Use a reverse proxy (Nginx, Caddy) for SSL, load balancing

```nginx
server {
    listen 80;
    server_name example.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment variables for production
- `NEXT_PUBLIC_*` — exposed to browser at build time
- All others — server-only
- `.env.production` → `next build` + `next start`
- `.env.local` overrides all (never committed)

## Custom Server
```ts
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const app = next({ dev: false })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(3000)
})
```

## SPAs with Next.js
For client-rendered only apps:
```tsx
// app/layout.tsx
export default function Layout({ children }) {
  return <html><body>{children}</body></html>
}
```
Use `'use client'` on all components and `next export` for static output.

## Multi-zones (micro-frontends)
Multiple Next.js apps under one domain. Configure via `next.config.js` rewrites.

## Multi-tenant
Share a single Next.js app across tenants using middleware to determine tenant context from hostname/path.

## Adapters
Custom deployment adapters via `adapterPath` config:
```js
module.exports = {
  adapterPath: './adapter.js',
}
```
Adapters hook into the build process with `modifyConfig` and `onBuildComplete`.

## PPR (Partial Prerendering)
Depends on platform support. Combines static shell with dynamic holes. Platform must implement PPR support.

## CDN caching considerations
- Static assets: `.next/static` → long cache with content-hash filenames
- HTML pages: short or no cache (depends on `Cache-Control` headers)
- API responses: configure via route segment config
- `Cache-Control` headers set automatically based on `revalidate` and `dynamic` configs

## CI build caching
Cache `.next/cache` between builds to speed up CI:
```bash
# GitHub Actions example
- uses: actions/cache@v3
  with:
    path: .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}
```

## Production checklist
1. `next build` succeeds without errors
2. Set appropriate `revalidate` strategies
3. Configure `remotePatterns` for images
4. Add environment variables
5. Configure CSP headers if needed
6. Enable compression (default on)
7. Use `output: 'standalone'` for Docker
8. Set up monitoring (Vercel Analytics, OpenTelemetry)
9. Configure `staleTimes` for optimal client cache
10. Test with production build: `next build && next start`
