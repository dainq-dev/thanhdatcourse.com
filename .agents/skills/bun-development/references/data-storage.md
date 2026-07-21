# Bun Data & Storage Reference

This reference covers Bun's high-performance file operations, native archive packaging, SQLite database engine, PostgreSQL templates, Redis integration, and native S3 operations.

---

## 1. File I/O & Streams
Bun performs direct system calls (like `io_uring` on Linux) to execute asynchronous file reads and writes without thread pool overhead.

```typescript
// Fast atomic file writes
await Bun.write("dest.txt", "Fast write content");

// Fast zero-copy file reads
const json = await Bun.file("config.json").json();
const bytes = await Bun.file("image.png").bytes();
```

### Gotchas:
- **No Automatic File Locks:** If concurrent async operations or distinct processes attempt to write to the same file path simultaneously, the file may be corrupted.
- **Buffer copy hazards:** Passing V8-compatible `Buffer` objects inside JavaScriptCore can occasionally lead to deep cloning overhead instead of zero-copy slice allocations.

### Best Practices:
- Standardize on modern **`Uint8Array`** instead of the Node.js legacy `Buffer` wherever possible.
- Use lockfiles or serialization queues for critical files written by multiple asynchronous routines.

---

## 2. SQLite (`bun:sqlite`)
Bun includes a built-in high-performance SQLite engine that runs native C code inside the JS thread.

```typescript
import { Database } from "bun:sqlite";

const db = new Database("local.db");
db.run("CREATE TABLE IF NOT EXISTS logs (msg TEXT)");

const stmt = db.prepare("INSERT INTO logs (msg) VALUES (?)");
stmt.run("Event fired");

const logs = db.query("SELECT * FROM logs").all();
```

### Gotchas:
- **Thread Blocking:** Since SQLite executes on the main JS thread for high performance, running extremely complex queries or heavy write transactions can cause latency spikes in your HTTP request loop.

### Best Practices:
- Keep SQLite databases highly localized (for caching, desktop local states, or configuration storage).
- For large, complex write transactions, offload execution to a background Worker thread.

---

## 3. Database SQL Client (`Bun.SQL`)
Bun includes a native SQL database client that supports PostgreSQL, MySQL, MariaDB, and SQLite with tagged template safety.

```typescript
import { SQL } from "bun";

const postgres = new SQL("postgres://user:pass@localhost:5432/mydb");
const status = "active";
const users = await postgres`SELECT id, name FROM users WHERE status = ${status}`;
```

### Gotchas:
- **Connection Pool Stuck Bug:** When `Bun.SQL` database transactions encounter strict constraint errors from the DB server (e.g., unique key violation errors on PostgreSQL), the connection pool can occasionally lock up. All subsequent database operations can freeze indefinitely until the server process is restarted.
- **Vendor Lock-in:** `Bun.SQL` is exclusive to the Bun runtime.

### Best Practices:
- For complex high-concurrency production databases, use standard driver libraries like `postgres.js` or `pg` running inside Bun, which are extremely mature.
- Set up connection health checks and restarts in your orchestrator (Docker/K8s) to automatically restart the container in case of connection pool freeze.

---

## 4. Valkey / Redis client (`bun:redis`)
An ultra-fast Valkey and Redis database client optimized with native Zig networking code.

```typescript
import { connect } from "bun:redis";

const redis = await connect({
  hostname: "localhost",
  port: 6379,
});

await redis.set("session:123", JSON.stringify({ userId: 42 }));
const session = await redis.get("session:123");
```

### Gotchas:
- **No Redis Cluster Support:** `bun:redis` does **not** support Redis Cluster (sharding). Trying to scale to a sharded Redis database will fail.

### Best Practices:
- Use `bun:redis` for ultra-fast, local caching, single-node Redis backends, or Valkey databases.
- If you require Redis Cluster, use `ioredis` instead.

---

## 5. AWS S3 Client (`Bun.s3`)
Fast S3/R2 storage driver optimized for high-throughput uploads and downloads.

```typescript
import { S3Client } from "bun";

const s3 = new S3Client({
  bucket: "my-bucket",
  accessKeyId: Bun.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: Bun.env.AWS_SECRET_ACCESS_KEY,
  endpoint: "https://my-endpoint.com",
});

// Fast Upload
await s3.write("report.pdf", Bun.file("local-report.pdf"));

// Fast Download
const fileBytes = await s3.file("report.pdf").bytes();
```

### Gotchas:
- **Limited Advanced Feature Support:** `Bun.s3` implements S3 core functionalities (upload, download, head). Advanced AWS features like custom KMS encryption configurations, bucket lifecycle policies, or deep IAM authentication hooks are not fully supported.

### Best Practices:
- Use `Bun.s3` for massive data upload/download performance (e.g., streaming user media uploads directly to S3/Cloudflare R2).
- For complex AWS setups, fall back to the official `@aws-sdk/client-s3`.
