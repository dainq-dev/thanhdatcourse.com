import { expect, test, describe } from "bun:test";
import app from "./index";

describe("API Service", () => {
  test("GET / returns 200 with JSON", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.service).toBe("thanhdatcomputer API");
    expect(data.version).toBe("1.0.0");
  });

  test("CORS headers are present", async () => {
    const res = await app.request("/", {
      headers: { Origin: "http://localhost:3000" },
    });
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  test("404 for unknown routes", async () => {
    const res = await app.request("/nonexistent");
    expect(res.status).toBe(404);
  });
});
