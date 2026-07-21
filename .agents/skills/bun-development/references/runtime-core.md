# Bun Runtime Core Reference

This reference covers the core runtime architecture, configuration, debugging, package initialization, and TypeScript/JSX integration of Bun (v1.3.x).

---

## 1. Engine & Runtime Architecture
Bun uses the **JavaScriptCore (JSC)** engine from WebKit, unlike Node.js and Deno which run on Google's V8 engine.

### Key Behaviors & Gotchas:
- **Error Stack Formats:** JSC formats error stack traces differently than V8. Do not write RegExp parsers that assume V8/Node-style stacks.
- **Garbage Collection (GC):** JSC's garbage collector frees memory using different heuristics than V8. Memory spikes might occur before collection. Do not assume immediate deallocation.
- **V8-Specific APIs:** Never use internal APIs of V8 (e.g., node's `v8` module, or custom V8 heap stats) in Bun development.

### Best Practices:
- Write standard, spec-compliant ECMAScript.
- If heap diagnostics are required, use Bun's global memory trackers like `process.memoryUsage()`.

---

## 2. CLI Execution & Watch Modes
Bun provides native CLI commands that execute code with high-performance reloading.

### Commands:
- `bun run <file.ts>`: Direct execution of TypeScript/JavaScript/JSX.
- `bun --watch <file.ts>`: Restarts the process on file changes. **Recommended for backend servers.**
- `bun --hot <file.ts>`: Performs Hot Module Replacement (HMR) without restarting. Sockets, HTTP servers, and database pools are preserved in memory.

### Gotchas:
- **Resource Leaking in Hot Mode:** If your entry file instantiates persistent resources (like a database connection pool or socket listeners) without clean-up handlers, `--hot` will double-allocate resources on every save, leading to port or socket exhaustion.

### Best Practices:
- Use `--watch` for stable server-side database connections.
- If using `--hot`, implement cleanup hooks on hot-reload:
  ```typescript
  // Example cleanup check
  if (globalThis.myDbPool) {
    await globalThis.myDbPool.close();
  }
  globalThis.myDbPool = createNewPool();
  ```

---

## 3. Debugging & REPL
- **Debugging:** Run `bun --inspect <file.ts>` to start the debugger.
  - *Gotcha:* Bun implements the **WebKit Inspector Protocol** instead of V8's Chrome DevTools Protocol (CDP). Connecting from `chrome://inspect` directly may fail.
  - *Best Practice:* Use VS Code's official debugger extension configured for Bun, or copy the exact webkit inspector URL printed in the terminal into Safari or a compatible WebKit client.
- **REPL:** Kicking off an interactive session with `bun` or `bun repl`.
  - *Gotcha:* Older versions may have glitches in terminal history loading or non-ASCII character entries.

---

## 4. `bunfig.toml` Configuration
`bunfig.toml` manages global and project-specific settings for the runtime, package manager, and bundler.

### Key Configuration Directives:
```toml
# bunfig.toml
[install]
# Force package manager options
optional = true
dev = true
peer = true
lockfile = true

[install.cache]
dir = "~/.bun/install/cache"
disable = false

[test]
# Test runner options
preload = ["./setup.ts"]
directory = "./tests"

[run]
# Auto-install missing packages on run (Disable for production!)
autoInstall = false
```

### Best Practices:
- Always commit a project-specific `bunfig.toml` in your repository root to enforce lockfile and registry configurations.
- Set `autoInstall = false` inside `bunfig.toml` to protect CI/CD systems from auto-downloading unverified packages.

---

## 5. TypeScript Integration (v6.0 & v7.0+)
Bun compiles TypeScript natively, eliminating the need for loaders like `ts-node` or `esbuild`.

### TS 6.0 & 7.0 Type Resolutions:
Starting with TypeScript 6.0, global types under `@types/*` are no longer automatically included. You must explicitly configure `tsconfig.json` to load Bun globals.

### Correct `tsconfig.json` Configuration:
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["bun", "node"],
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

### Gotchas:
- **No Type-Checking:** Bun's engine *only strips* types to run code immediately. It does **not** check for compile-time type errors.

### Best Practices:
- Run `tsc --noEmit` as an independent validation step on CI/CD pipelines before code deployment.
- Install dev dependencies for types: `bun add -d @types/bun`.

---

## 6. Project Scaffolding
- `bun init`: Instantly scaffolds a clean TS project structure. Use `bun init -y` to skip prompts.
- `bun create <template> <destination>`: Bootstraps framework templates (e.g., React, Next.js, Svelte).
  - *Gotcha:* Community-maintained templates under `bun create` can occasionally contain outdated dependencies.
  - *Best Practice:* Use verified toolchain starters (e.g., `bun create vite@latest`) for frontend frameworks to ensure dependency health.
