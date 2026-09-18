import { sql } from "kysely";

import { createRouter } from "@/core/router";
import { db } from "@/modules/db";

export const healthRouter = createRouter();

/** Liveness: the process answers. Never touches the database. */
healthRouter.get("/health", (c) => c.json({ status: "ok" }));

/** Readiness: the process can actually serve traffic. */
healthRouter.get("/health/ready", async (c) => {
  try {
    await sql`select 1`.execute(db);
    return c.json({ status: "ok", database: "ok" });
  } catch {
    return c.json({ status: "degraded", database: "unreachable" }, 503);
  }
});
