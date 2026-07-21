import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sign, verify } from "hono/jwt";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { LoginSchema, RegisterSchema } from "@workspace/types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRY = 60 * 60 * 24; // 24 hours

export const authRoutes = new Hono()
  .post("/login", zValidator("json", LoginSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.passwordHash) {
      return c.json({ error: "Email hoặc mật khẩu không đúng" }, 401);
    }

    const valid = await Bun.password.verify(password, user.passwordHash);
    if (!valid) {
      return c.json({ error: "Email hoặc mật khẩu không đúng" }, 401);
    }

    const token = await sign(
      { userId: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY },
      JWT_SECRET,
      "HS256"
    );

    return c.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  })
  .post("/register", zValidator("json", RegisterSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return c.json({ error: "Email đã được sử dụng" }, 409);
    }

    const hash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 12 });
    const id = crypto.randomUUID();

    await db.insert(users).values({ id, email, passwordHash: hash, name, role: "USER" });

    const token = await sign(
      {
        userId: id,
        email,
        role: "USER",
        exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY,
      },
      JWT_SECRET
    );

    return c.json({ token, user: { id, email, name, role: "USER" } }, 201);
  })
  .get("/me", async (c) => {
    const header = c.req.header("Authorization");
    const token = header?.replace("Bearer ", "");
    if (!token) return c.json({ error: "Unauthorized" }, 401);

    try {
      const payload = await verify(token, JWT_SECRET, "HS256");
      const userId = (payload as { userId: string }).userId;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return c.json({ error: "User not found" }, 404);

      return c.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch {
      return c.json({ error: "Invalid token" }, 401);
    }
  });

export type AuthRoutes = typeof authRoutes;
