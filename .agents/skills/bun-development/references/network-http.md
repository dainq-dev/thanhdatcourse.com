# Bun Network & HTTP Reference

This reference covers the HTTP serving, routing, cookies, TLS, WebSockets, TCP/UDP sockets, DNS caching, and native client calls of Bun (v1.3.x).

---

## 1. HTTP Server (`Bun.serve`)
Bun's native HTTP server operates at extreme speed by executing zero-copy system calls.

```typescript
Bun.serve({
  port: 3000,
  routes: {
    "/": () => new Response("Homepage"),
    "/api/users": () => new Response("All users"),
    "/api/users/:id": (req) => new Response(`User: ${req.params.id}`), // Dynamic route
    "/api/files/*": (req) => new Response(`Catch-all: ${req.params["*"]}`),
  },
  fetch(req) {
    return new Response("Fallback Endpoint", { status: 404 });
  },
  error(err) {
    return new Response(`Custom Error: ${err.message}`, { status: 500 });
  }
});
```

### Gotchas:
- **Streaming Backpressure:** If you return a custom `ReadableStream` response and the client consumes it slowly, Bun can run into memory bloat trying to buffer data in RAM.
- **TLS Reloading:** If certificate files are updated on disk (e.g., Let's Encrypt renewal), the server continues to use the cached in-memory SSL keys.
- **Uncaught Exception sập server:** Throwing a fatal error inside the `error()` handler immediately kills the server process.
- **Dynamic params types:** All matched route arguments in `req.params` are string-typed. You must validate and parse them manually.

### Best Practices:
- **Zero-Copy File Streaming:** Stream files by passing a `BunFile` handler directly to the `Response` object:
  ```typescript
  return new Response(Bun.file("massive-file.mp4"));
  ```
- Always wrap complex database or network logic inside `fetch()`/`routes` handlers with `try/catch`.
- Set up a cron script to reload the Bun server (or send a SIGUSR2 signal if supported) when SSL certificates are renewed, or proxy TLS connections using Caddy/Nginx.

---

## 2. WebSockets
High-performance WebSocket serving with native Pub/Sub.

```typescript
Bun.serve({
  websocket: {
    idleTimeout: 60, // disconnect after 60s
    sendPings: true, // auto ping-pong keep-alive
    open(ws) {
      ws.subscribe("news-feed");
    },
    message(ws, msg) {
      ws.publish("news-feed", `Update: ${msg}`); // Publishes to all subscribers
    },
    close(ws) {
      ws.unsubscribe("news-feed");
    }
  },
  fetch(req, server) {
    if (server.upgrade(req)) return; // Upgrades connection to WebSocket
    return new Response("Regular HTTP response");
  }
});
```

### Gotchas:
- Without `sendPings: true`, clients behind proxy services (like Cloudflare or enterprise firewalls) will experience silent timeouts and disconnections after brief periods of inactivity.

### Best Practices:
- Always use `sendPings: true` in your websocket configuration.
- Leverage the native pub/sub API (`ws.subscribe()`, `ws.publish()`) instead of manually looping over arrays of socket references in JavaScript.

---

## 3. Native TCP & UDP Sockets
- **TCP Server & Client:** Use `Bun.listen()` and `Bun.connect()`.
  - *Gotcha:* Opening thousands of concurrent raw TCP sockets without increasing the OS limits will trigger `EMFILE` (too many open files) errors.
  - *Best Practice:* Run `ulimit -n 65535` on your Linux host before launching raw socket servers.
- **UDP Sockets:** Native high-performance datagrams.
  ```typescript
  import { udpSocket } from "bun";
  const socket = await udpSocket({
    port: 9999,
    socket: {
      data(socket, buf, port, addr) {
        console.log(`Received datagram from ${addr}:${port}`);
      }
    }
  });
  socket.send("Ping", 9999, "127.0.0.1");
  ```
  - *Gotcha:* Datagrams exceeding the standard MTU size (1500 bytes) will be fragmented on the network layer, leading to packet losses. Keep UDP packets below 1400 bytes.

---

## 4. DNS Resolution & Cache (`Bun.dns`)
Bun provides an integrated DNS module with built-in DNS prefetching and caching.

```typescript
import { dns } from "bun";
const ip = await dns.lookup("api.service.com");

// Prefetch DNS resolution to avoid initial fetch latency
dns.prefetch("third-party-api.com");
```

### Gotchas:
- Bun caches DNS lookups (up to 255 entries, default TTL of 30 seconds). If your target microservice undergoes rapid dynamic scaling or fails over to a different IP, the Bun client will target the stale cached IP until the TTL expires.

### Best Practices:
- For servers connecting to highly dynamic targets, configure lower DNS cache TTL parameters or implement retry middleware with clean TCP disconnect states.
- Prefetch nameservers of crucial third-party APIs during server startup.
