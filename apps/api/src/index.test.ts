import { expect, test, describe } from "bun:test";
import app from "./index";

describe("API Service", () => {
  test("GET /", async () => {
    // Note: app is the export default object { port, fetch } from hono under bun.serve
    // But since Hono instance itself has .fetch, we can just use app.fetch directly.
    // Wait, the export default is actually an object with .fetch.
    const res = await app.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("API Service is running!");
  });
});
