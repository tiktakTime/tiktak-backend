import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { env } from "@/core/env";

import type { DB } from "./generated/kysely";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 50,
  min: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on("error", (error) => {
  console.error("Unexpected error on idle PostgreSQL client:", error);
});

// `tsx watch` re-imports this module on every reload; without the global the
// old pool leaks its sockets.
const globalForDb = globalThis as { __db?: Kysely<DB> };

export const db =
  globalForDb.__db ??
  new Kysely<DB>({ dialect: new PostgresDialect({ pool }) });

if (env.NODE_ENV === "development") {
  globalForDb.__db = db;
}

/** Kysely bağlantı havuzunu kapat. */
export async function closeDb() {
  await db.destroy();
}
