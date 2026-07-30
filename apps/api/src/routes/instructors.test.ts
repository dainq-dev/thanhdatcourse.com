import { beforeAll, describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { authRoutes } from "./auth";
import { courseInstructorRoutes, instructorRoutes } from "./instructors";

const app = new Hono()
  .route("/api/auth", authRoutes)
  .route("/api/instructors", instructorRoutes)
  .route("/api", courseInstructorRoutes);

let adminToken: string;
let instId: string;

beforeAll(async () => {
  const res = await app.request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@minhtravel.vn",
      password: "admin123",
    }),
  });
  const data = await res.json();
  adminToken = data.token;
});

describe("Instructors API", () => {
  test("GET /api/instructors — list", async () => {
    const res = await app.request("/api/instructors");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
  });

  test("POST /api/instructors — create", async () => {
    const res = await app.request("/api/instructors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "Test Instructor",
        title: "Teacher",
        bio: "Bio text",
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.name).toBe("Test Instructor");
    instId = json.data.id;
  });

  test("GET /api/instructors/:id", async () => {
    const res = await app.request(`/api/instructors/${instId}`);
    expect(res.status).toBe(200);
  });

  test("PUT /api/instructors/:id", async () => {
    const res = await app.request(`/api/instructors/${instId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ title: "Updated Title" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.title).toBe("Updated Title");
  });

  test("DELETE /api/instructors/:id", async () => {
    const res = await app.request(`/api/instructors/${instId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
  });

  test("POST without auth — 401", async () => {
    const res = await app.request("/api/instructors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X" }),
    });
    expect(res.status).toBe(401);
  });
});
