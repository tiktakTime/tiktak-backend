import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";

import { getDatabaseName, getDatabaseUrl } from "@tiktak/env";

export type DatabaseHealth = {
  ok: true;
  database: string;
};

// Populated after prisma db pull + generate.
interface DB {}

let pool: Pool | undefined;
let db: Kysely<DB> | undefined;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 5,
      connectionTimeoutMillis: 10_000,
    });
  }

  return pool;
}

export function getDb() {
  if (!db) {
    db = new Kysely<DB>({
      dialect: new PostgresDialect({ pool: getPool() }),
    });
  }

  return db;
}

export async function checkDatabaseConnection(): Promise<DatabaseHealth> {
  await sql`select 1 as ok`.execute(getDb());

  return {
    ok: true,
    database: getDatabaseName(),
  };
}

export async function closeDatabase() {
  if (db) {
    await db.destroy();
    db = undefined;
    pool = undefined;
    return;
  }

  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
