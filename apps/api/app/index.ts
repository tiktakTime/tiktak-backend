import { createApp } from "@tiktak/http/app/create-app";
import { checkDatabaseConnection } from "@tiktak/database/client";

export function createConfiguredApp() {
  const app = createApp();

  app.get("/healthz", (c) => {
    return c.text("healthy");
  });

  app.get("/healthz/db", async (c) => {
    try {
      const result = await checkDatabaseConnection();
      return c.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      return c.json({ ok: false, error: message }, 503);
    }
  });

  return app;
}
