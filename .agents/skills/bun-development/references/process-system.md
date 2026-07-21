# Bun Process & System Reference

This reference covers Bun's subprocess management, cross-platform shell script execution, background workers, task scheduling, and web automation tools (v1.3.x).

---

## 1. Environment Variables
Bun automatically parses environment variables from `.env`, `.env.local`, `.env.production` at startup into `Bun.env` and `process.env`.

### Gotchas:
- **OS Variables Override:** System-defined environment variables take absolute priority and will silently overwrite definitions inside `.env` files.
- **Static Resolution:** Env files are parsed once on process start. Modifying `.env` files on disk during execution will not affect running variables until process restart.

### Best Practices:
- Keep all local development keys inside `.env.local` (and add it to `.gitignore`).
- For production, pass variables natively through container orchestration environments (Docker/Kubernetes).

---

## 2. Bun Shell (`Bun.$`)
Cross-platform shell execution environment built natively inside the Bun runtime.

```typescript
import { $ } from "bun";

// Execute command and capture output
const count = await $`ls | wc -l`.text();

// Pipe outputs
await $`cat data.csv | grep "Active" > active.csv`;
```

### Gotchas:
- **Custom Interpreter:** Bun Shell runs a custom interpreter written in Zig; it does not launch native `/bin/sh` or `/bin/bash`. Shell aliases or custom system shell functions will not resolve.
- **CRITICAL INJECTION RISK:** Using raw string injection, such as `$.raw(userInput)`, on unsanitized web forms will expose your server to **Command Injection** attacks.

### Best Practices:
- Always use standard template literals (e.g., $ followed by backticks) for variable bindings. Bun automatically and securely escapes variables.
- Never use `$.raw()` on untrusted user input.

---

## 3. Subprocesses (`Bun.spawn`)
Direct, highly optimized execution of OS-level processes.

```typescript
// Fast asynchronous spawn
const proc = Bun.spawn(["ffmpeg", "-i", "input.mp4", "output.webm"]);

// Await completion
const status = await proc.exited;
console.log(`Exit code: ${status}`);
```

### Gotchas:
- **Zombie Process Leakage:** If the parent Bun process receives a termination signal (`SIGINT`, `SIGTERM`) and exits, spawned subprocesses can become orphaned (zombie processes) and run infinitely, depleting system resources.

### Best Practices:
- Bind a cleanup handler to terminate subprocesses when the parent exits:
  ```typescript
  const proc = Bun.spawn(["python", "script.py"]);
  process.on("exit", () => proc.kill());
  ```

---

## 4. Cron Task Scheduler (`Bun.cron`)
Built-in task scheduler running either inside the process (in-process) or using OS cron services.

```typescript
import { cron } from "bun";

cron({
  pattern: "*/5 * * * *", // Every 5 minutes
  run() {
    console.log("Cleanup task running...");
  },
});
```

### Gotchas:
- **UTC Timezone Default:** `Bun.cron` patterns evaluate in the **UTC** timezone by default.
- **OS-Level Permissions:** Using the OS-level cron daemon requires background service support and root permissions. This fails inside microservice Docker container instances (like Alpine) lacking standard Cron services.

### Best Practices:
- Standardize on in-process `Bun.cron` schedulers for long-running servers.
- Explicitly map execution schedules assuming UTC time zones.

---

## 5. Web Workers (Concurrency)
Bun supports standard Web Workers to offload intensive operations to separate threads.

```typescript
// Main Thread
const worker = new Worker(new URL("./calc-worker.ts", import.meta.url));
worker.postMessage({ array: [1, 2, 3] });

// calc-worker.ts
self.onmessage = (e) => {
  const result = e.data.array.reduce((a, b) => a + b, 0);
  self.postMessage({ result });
};
```

### Gotchas:
- **High Thread Initialization Cost:** Each Web Worker instantiates an isolated JavaScriptCore virtual machine. Spawning workers frequently per HTTP request will immediately cause memory exhaustion.
- **Structured Clone Overhead:** Message passing via `postMessage` copies data, adding serialization time for large payloads.

### Best Practices:
- Initialize a static **Worker Pool** on startup, reusing workers for heavy operations.
- Share raw binary data arrays using **`SharedArrayBuffer`** to avoid copy overhead.

---

## 6. WebView (`Bun.WebView`)
Experimental built-in desktop WebView automation.
- *Gotcha:* WebView relies on the host OS's native desktop rendering engine. It **will crash immediately** inside standard headless Docker containers, cloud VMs, or Linux server setups lacking a graphical server (X11/Wayland).
- *Best Practice:* Keep WebView strictly for localized desktop GUI tools.
