# Bun File & Module System Reference

This reference covers Bun's native file loading, hybrid module resolution, JSX, auto-installation behavior, compiler plugins, and File System Routing.

---

## 1. Native File Loading (File Types)
Bun has high-performance native parsers for diverse file extensions:
- `.js`, `.ts`, `.jsx`, `.tsx`
- `.json`, `.json5`, `.jsonl`
- `.toml`, `.yaml`
- `.txt`
- `.wasm`

### Best Practices:
- Read local TOML or YAML files simply by importing them directly! No need to install and parse with third-party libraries:
  ```typescript
  import config from "./config.yaml";
  console.log(config.database.host);
  ```

---

## 2. Hybrid Module Resolution
Bun natively supports both **ES Modules (`import`/`export`)** and **CommonJS (`require()`/`module.exports`)** in the exact same file.

```typescript
// You can require ESM packages!
const lodashEs = require("lodash-es");

// You can import CommonJS packages!
import cjsPackage from "./legacy-cjs-file.js";
```

### Gotchas:
- **Dual-Package Hazard:** If a package provides both ESM and CommonJS entries, importing one and requiring the other elsewhere in your codebase will result in two instances of that module in memory, breaking Singleton states.
- **Node-only ESM resolution quirks:** Node.js enforces absolute file extensions (`.js` or `.mjs`) inside ESM imports. Bun does not, but you should stick to standard extension formats if you aim for cross-platform compatibility.

### Best Practices:
- Standardize on ESM (`import`/`export`) across your entire repository.
- Avoid using `require()` unless loading legacy modules.

---

## 3. JSX Integration
Bun features out-of-the-box JSX compilation.

### Gotchas:
- By default, Bun compiles JSX to react-compatible code (React 17+ `react/jsx-runtime`). If your project uses custom frameworks (like SolidJS or Preact), compile errors or visual failures will occur if configs are wrong.

### Best Practices:
- Configure custom JSX options inside `tsconfig.json` or `bunfig.toml` if using Preact/SolidJS:
  ```json
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
  ```

---

## 4. Auto-Install Behavior
When running scripts via `bun run`, Bun will attempt to auto-download and install any missing import dependencies from npm in memory to complete the task.

### Gotchas:
- **CRITICAL SECURITY RISK IN PRODUCTION:** If an attacker inserts malicious package imports into your server, Bun will download and execute them dynamically. Auto-install also introduces unpredictable cold-start latency.

### Best Practices:
- **Disable auto-install globally** in production. Launch scripts using:
  ```bash
  bun run --no-install server.ts
  ```
- Configure `autoInstall = false` in your root `bunfig.toml` under the `[run]` section.

---

## 5. Compiler Plugins (`Bun.plugin`)
You can hook into Bun's transpiler and bundler to load custom formats (e.g., `.vue`, `.svelte`, `.yaml`).

```typescript
import { plugin } from "bun";

plugin({
  name: "Custom Suffix Loader",
  setup(build) {
    build.onLoad({ filter: /\.custom$/ }, async (args) => {
      const text = await Bun.file(args.path).text();
      return {
        contents: `export default ${JSON.stringify(text)};`,
        loader: "js",
      };
    });
  },
});
```

### Gotchas:
- **Synchronous Bottlenecks:** Plugins execute in a synchronous phase. Doing blocking CPU tasks or heavy HTTP fetch calls inside plugin hooks will stall your application startup.

### Best Practices:
- Implement in-memory caches inside plugin load callbacks to skip file re-reads.
- Keep plugin logic atomic and fast.

---

## 6. File System Router (`Bun.FileSystemRouter`)
Bun provides a low-level, high-performance router that maps directory trees to HTTP endpoints.

```typescript
const router = new Bun.FileSystemRouter({
  style: "nextjs",
  dir: "./pages",
});

const match = router.match("/users/123");
if (match) {
  console.log(match.filePath);  // e.g. "/pages/users/[id].ts"
  console.log(match.params.id); // "123"
}
```

### Gotchas:
- **No App Router support:** Only supports the dynamic Pages Router syntax (e.g., `[param].ts`). Next.js 13+ App Router (directory-based routing with `layout.tsx` and `page.tsx`) is **not** supported natively.
- **Resource limit:** Scaling directories beyond 64+ files can experience minor bottlenecks on slow disks under old OS layers.

### Best Practices:
- `Bun.FileSystemRouter` is a low-level API designed for **framework authors**.
- For regular application backend development, use standard declarative routing in `Bun.serve` (refer to the Network & HTTP reference).
