import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { env } from "@tiktak/env";

import type { DB } from "./kysely/index.js";

const isSeedMode =
  process.argv.includes("--seed") ||
  process.env.SEED_MODE === "true" ||
  process.argv[1]?.includes("seed") === true;

const globalForDb = globalThis as { db?: Kysely<DB> };

const createPool = (connectionString: string, max: number, min: number) =>
  new Pool({
    connectionString,
    max,
    min,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

const pool = createPool(env.DATABASE_URL, 50, 5);

const kysely = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
});

let seedKysely: Kysely<DB> | null = null;
if (isSeedMode) {
  const seedPool = createPool(env.DIRECT_URL || env.DATABASE_URL, 5, 1);
  seedKysely = new Kysely<DB>({
    dialect: new PostgresDialect({ pool: seedPool }),
  });
}

if (env.NODE_ENV === "development" && !isSeedMode) {
  if (!globalForDb.db) {
    globalForDb.db = kysely;
  }
}

if (env.NODE_ENV === "production" && !isSeedMode) {
  const closePool = async (signal: string) => {
    console.log(`Received ${signal}. Closing PostgreSQL pool...`);
    await pool.end();
    process.exit(0);
  };

  process.once("SIGINT", () => closePool("SIGINT"));
  process.once("SIGTERM", () => closePool("SIGTERM"));
}

pool.on("error", (err) => {
  console.error("⚠️ Unexpected error on idle PostgreSQL client:", err);
});

export const db =
  isSeedMode && seedKysely
    ? seedKysely
    : env.NODE_ENV === "development" && globalForDb.db
      ? globalForDb.db
      : kysely;
