import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Media Service is running!"));

export default {
  port: 3002,
  fetch: app.fetch,
};
