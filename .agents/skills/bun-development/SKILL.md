---
name: bun-development
description: Master instruction manual for high-performance JavaScript/TypeScript development using the Bun Runtime (v1.3.x). Trigger this skill immediately whenever the user mentions Bun, SQLite, PostgreSQL connections via Bun, Redis under Bun, WebSockets, fast HTTP serving, task scheduling, image processing via Bun.Image, native binary compiling, or wants to run, build, test, or package applications using Bun CLI instead of Node.js or Deno.
---

# Bun Development Skill

This skill guides the agent in using the full power of the Bun runtime, compiler, and built-in Zig/C++ APIs to build ultra-fast, robust, and optimized software.

---

## 1. Core Principles

When developing for Bun:
- **Spec-Compliant ESM:** Prioritize standard ES Modules (`import`/`export`) over CommonJS.
- **Zero NPM Dependencies:** Check if Bun provides a native, optimized Zig/C++ built-in before installing npm packages (e.g. use `Bun.file` instead of `fs`, `Bun.Image` instead of `sharp`).
- **JSC Compatibility:** Test code behavior assuming Apple's JavaScriptCore (JSC) engine instead of V8. Never use internal V8 flags or V8-specific npm extensions.
- **Defensive API usage:** Always implement error handling for connection pools, file locks, background workers, and FFI pointers.

---

## 2. Developer Workflow & Task Resolution

To leverage the full power of Bun, the Agent must read the specific domain documentation under the `references/` directory.

### Step 1: Identify the Task Domain
Map the user's request to one or more of the reference files listed below:

| Task Domain | Reference File | Topics Covered |
| :--- | :--- | :--- |
| Core setup, configs, watch mode, debugging, TypeScript settings | [runtime-core.md](file:///home/dainguyen/Desktop/FIDT/internal-hub/.cursor/skills/bun-development/references/runtime-core.md) | `bunfig.toml`, watch/hot modes, WebKit Inspector, TS 6.0/7.0 tsconfig types |
| File parsing, module resolution, JSX runtime, custom bundler plugins | [file-system.md](file:///home/dainguyen/Desktop/FIDT/internal-hub/.cursor/skills/bun-development/references/file-system.md) | CJS/ESM compatibility, auto-install disable, compiler plugins, FileSystemRouter |
| HTTP server, routes, WebSockets, UDP/TCP sockets, DNS caching | [network-http.md](file:///home/dainguyen/Desktop/FIDT/internal-hub/.cursor/skills/bun-development/references/network-http.md) | `Bun.serve` routing syntax, WS ping-pong, Pub/Sub, DNS prefetch |
| Database SQL, SQLite, Redis client, AWS S3 / Cloudflare R2 | [data-storage.md](file:///home/dainguyen/Desktop/FIDT/internal-hub/.cursor/skills/bun-development/references/data-storage.md) | `Bun.SQL` connection stuck issue, `bun:sqlite` thread block, `Bun.s3` limitations |
| Subprocesses, custom shell, cron schedulers, thread workers | [process-system.md](file:///home/dainguyen/Desktop/FIDT/internal-hub/.cursor/skills/bun-development/references/process-system.md) | `Bun.spawn` zombie cleanups, Bun Shell command injection, `Bun.cron`, Worker pool |
| FFI, TinyCC, CSRF, Secrets, HTMLRewriter, Image, hashing, utils | [interop-utilities.md](file:///home/dainguyen/Desktop/FIDT/internal-hub/.cursor/skills/bun-development/references/interop-utilities.md) | FFI segfault risks, `Bun.Image` Linux AVIF limitation, Argon2id event-loop lock, HTMLRewriter |

### Step 2: Read Reference Docs
Before writing any code or commands, the Agent **MUST** view the respective reference markdown file in `references/` using the file viewer tool. Under no circumstances should the Agent write code based on assumptions if the reference document outlines specific gotchas and syntax formats.

### Step 3: Implement & Validate
- Run scripts and tests via `bun run` or `bun test`.
- For production, verify type-checking using `tsc --noEmit` and run servers with the `--no-install` flag.
