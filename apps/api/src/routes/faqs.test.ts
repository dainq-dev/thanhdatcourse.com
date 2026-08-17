import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { faqs, users } from "../db/schema";
import { app } from "../index";

describe("FAQs Routes", () => {
  let adminToken: string;
  let createdFaqId: string;
  const testAdminEmail = "test-faqs-admin@example.com";

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, testAdminEmail));

    const adminHash = await Bun.password.hash("admin123", {
      algorithm: "bcrypt",
      cost: 12,
    });
    await db.insert(users).values({
      id: "faqs-admin-id",
      email: testAdminEmail,
      passwordHash: adminHash,
      name: "FAQs Admin",
      role: "ADMIN",
    });

    const adminRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testAdminEmail, password: "admin123" }),
    });
    adminToken = (await adminRes.json()).token;
  });

  afterAll(async () => {
    if (createdFaqId) {
      await db.delete(faqs).where(eq(faqs.id, createdFaqId));
    }
    await db.delete(users).where(eq(users.email, testAdminEmail));
  });

  test("GET / returns array of FAQs", async () => {
    const res = await app.request("/api/faqs");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    for (const faq of data) {
      expect(faq.question).toBeDefined();
      expect(faq.answer).toBeDefined();
      expect(faq.sortOrder).toBeDefined();
    }
  });

  test("GET / with course_id filter returns only that course's FAQs", async () => {
    const allRes = await app.request("/api/faqs");
    const allFaqs = await allRes.json();

    const seedCourseId = allFaqs[0]?.courseId;
    if (seedCourseId) {
      const res = await app.request(`/api/faqs?course_id=${seedCourseId}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      for (const faq of data) {
        expect(faq.courseId).toBe(seedCourseId);
      }
    }
  });

  test("POST / creates a FAQ (ADMIN)", async () => {
    const res = await app.request("/api/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        question: "Test question?",
        answer: "Test answer.",
        sortOrder: 99,
      }),
    });
    expect(res.status).toBe(201);
    const faq = await res.json();
    expect(faq.id).toBeDefined();
    expect(faq.question).toBe("Test question?");
    expect(faq.answer).toBe("Test answer.");
    expect(faq.sortOrder).toBe(99);
    createdFaqId = faq.id;
  });

  test("PUT /:id updates a FAQ (ADMIN)", async () => {
    const res = await app.request(`/api/faqs/${createdFaqId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        question: "Updated question?",
        answer: "Updated answer.",
      }),
    });
    expect(res.status).toBe(200);
    const faq = await res.json();
    expect(faq.question).toBe("Updated question?");
    expect(faq.answer).toBe("Updated answer.");
  });

  test("DELETE /:id deletes a FAQ (ADMIN)", async () => {
    const createRes = await app.request("/api/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        question: "To be deleted?",
        answer: "Yes.",
      }),
    });
    const tempId = (await createRes.json()).id;

    const deleteRes = await app.request(`/api/faqs/${tempId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(deleteRes.status).toBe(200);
    expect((await deleteRes.json()).success).toBe(true);
  });
});
