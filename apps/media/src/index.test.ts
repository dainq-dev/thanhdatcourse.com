import { describe, expect, test } from "bun:test";
import app from "./index";

describe("Media Service", () => {
  test("GET / returns 200 with JSON", async () => {
    const res = await app.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.service).toBe("thanhdatcomputer Media");
    expect(data.version).toBe("1.0.0");
  });
});
