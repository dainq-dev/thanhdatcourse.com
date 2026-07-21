import { expect, test, describe } from "bun:test";
import app from "./index";

describe("Media Service", () => {
  test("GET /", async () => {
    const res = await app.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Media Service is running!");
  });
});
