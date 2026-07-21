import { createMiddleware } from "hono/factory";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

declare module "hono" {
  interface ContextVariableMap {
    user: { userId: string; email: string; role: string };
  }
}

export function authMiddleware(requiredRole?: "ADMIN" | "USER") {
  return createMiddleware(async (c, next) => {
    const header = c.req.header("Authorization");
    const token = header?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "Unauthorized — missing token" }, 401);
    }

    try {
      const { verify } = await import("hono/jwt");
      const payload = await verify(token, JWT_SECRET, "HS256");
      const user = payload as { userId: string; email: string; role: string };

      if (requiredRole && user.role !== requiredRole) {
        return c.json({ error: "Forbidden — insufficient permissions" }, 403);
      }

      c.set("user", user);
      await next();
    } catch {
      return c.json({ error: "Unauthorized — invalid or expired token" }, 401);
    }
  });
}
