# Bun Interop & Utilities Reference

This reference covers Bun's native FFI, in-process C compilation, security toolings, data parsing formats, HTML manipulation, hashing, and standard compatibility libraries.

---

## 1. Native FFI & C Compiler (`bun cc`)
Call dynamic system libraries (.dylib, .so, .dll) directly from JS/TS without writing native Node-API bindings.

```typescript
import { dlopen, FFIType } from "bun:ffi";

const lib = dlopen("libmath.so", {
  add: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.i32
  }
});
console.log(lib.symbols.add(10, 20)); // 30
```

### Gotchas:
- **No Safety Net / Segfault Crash:** Passing invalid pointer references or accessing out-of-bounds memory via FFI will trigger a **Segmentation Fault (segfault)**. This instantly crashes the entire Bun process. It cannot be caught using JS `try/catch`.
- **TinyCC lack of optimizations:** `bun cc` uses TinyCC to compile C files in-process in milliseconds. However, TinyCC **performs no advanced compilation optimizations** (like GCC's `-O3` flag). The resulting binary is significantly slower.

### Best Practices:
- Always perform defensive type validation on input variables in JavaScript before invoking FFI hooks.
- Use `bun cc` only for fast development mockups or utility tasks. For production performance, compile C/Rust code using GCC/Clang/Cargo before loading.

---

## 2. HTMLRewriter
Streaming HTML parser and rewriter inspired by Cloudflare Workers.

```typescript
const rewriter = new HTMLRewriter().on("h1", {
  element(el) {
    el.setInnerContent("Welcome to Bun");
  }
});

const cleanHtmlResponse = rewriter.transform(new Response("<h1>Hello</h1>"));
```

### Gotchas:
- **Streaming Parser Limits:** HTMLRewriter parses HTML as a linear stream. It does not construct a full DOM tree in memory. You cannot perform operations that require traversing parent/sibling relations backwards (e.g., finding the parent of a tag).

### Best Practices:
- Use HTMLRewriter for blazing-fast Edge tasks (like dynamic SEO injection, Google Analytics scripts insertion, and proxy manipulation).
- For complex DOM tree parsing, fall back to Cheerio or JSDOM.

---

## 3. Cryptography & Hashing
- **Wyhash (`Bun.hash`):** Ultra-fast, non-cryptographic hashing.
  - *Best Practice:* Use for building internal cache keys, hashes, or verifying data duplicates.
- **Mật khẩu (`Bun.password`):** Secure hashing via bcrypt, argon2id, scrypt, etc.
  ```typescript
  const hash = await Bun.password.hash("mypassword", "argon2id");
  const isMatch = await Bun.password.verify("mypassword", hash);
  ```
  - *Gotcha:* Argon2id and bcrypt are designed to block execution to prevent brute-forcing. **Executing password hashes directly on your server's main thread will cause severe request hangs.**
  - *Best Practice:* Delegate `Bun.password` operations to background Workers.

---

## 4. Native Image Processing (`Bun.Image` - v1.3.14+)
High-speed drop-in replacement for the `sharp` library.

```typescript
await Bun.file("cover.png")
  .image()
  .resize(400, 300)
  .webp()
  .write("cover_thumb.webp");
```

### Gotchas:
- **AVIF, HEIC, and TIFF are macOS and Windows ONLY.** Running these on standard Linux containers (e.g., standard Docker images) will throw errors.
- Advanced compositing (watermarks, text overlays, filters) are not supported.

### Best Practices:
- Keep `sharp` inside your dependencies if you must support AVIF inputs on Linux production systems.
- Use `Bun.Image` for fast, standard thumbnails and WebP conversions.

---

## 5. Security: CSRF & Secrets
- **CSRF Protection (`Bun.CSRF`):** Generates and verifies HMAC-signed tokens.
  - *Gotcha:* If no `secret` is provided, Bun generates a thread-local random key. In multi-instance clustering, verification will fail across instances. Always specify a static `secret` and pass `sessionId` to bind the token securely to a session.
- **Secrets API (`Bun.secrets`):** Native credential storage (Keychain, Credential Manager).
  - *Gotcha:* Local development CLI only. Fails on cloud VMs/containers that lack credential storage daemons.

---

## 6. Utilities
- **Glob (`Bun.Glob`):** Optimized file matching patterns (e.g., `new Glob("**/*.ts")`).
- **Semver (`Bun.semver`):** Fully compatible with `node-semver` but runs 20x faster.
- **Color (`Bun.color`):** Fast parser/converter for Hex, RGB, HSL, and ANSI terminal codes.
- **Standard Parsers:** `Bun.TOML`, `Bun.YAML`, `Bun.JSON5`, `Bun.JSONL` parsers are built-in.
  - *Gotcha:* Incorrectly formatted inputs in TOML/YAML files throw hard runtime exceptions; wrap parser calls in `try/catch`.
