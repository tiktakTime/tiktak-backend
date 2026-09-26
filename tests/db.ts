import { sql } from "kysely";

import { env } from "@/core/env";
import { closeRedis, getRedis } from "@/core/redis";
import { closeDb, db } from "@/modules/db";

function databaseName(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\//, "");
  } catch {
    return "";
  }
}

/** Test DB adı `-test` içermiyorsa süreci durdur. Canlıya truncate gitmesin. */
export function assertTestDatabase(): void {
  const url = env.DATABASE_URL ?? "";
  const name = databaseName(url);

  if (!name.includes("-test")) {
    console.error(
      `Refusing to test against database "${name || url || "(empty)"}". The database name must contain "-test".`,
    );
    process.exit(1);
  }
}

/** Test Redis'ini temizle (db 15). Tablolara dokunmaz. */
export async function flushTestRedis(): Promise<void> {
  await getRedis().flushdb();
}

/** Tabloları boşalt ve test Redis DB'sini temizle. */
export async function resetDb(): Promise<void> {
  const tables = await sql<{ tablename: string }>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `.execute(db);

  if (tables.rows.length > 0) {
    const names = sql.join(tables.rows.map((row) => sql.id(row.tablename)));
    await sql`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`.execute(db);
  }

  await flushTestRedis();
}

/** Başarısız testte satır sayılarını bas. */
export async function dumpRowCounts(): Promise<void> {
  const tables = await sql<{ tablename: string }>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
    ORDER BY tablename
  `.execute(db);

  const counts: Record<string, number> = {};
  for (const row of tables.rows) {
    const result = await sql<{ count: string }>`
      SELECT count(*)::text AS count FROM ${sql.id(row.tablename)}
    `.execute(db);
    counts[row.tablename] = Number(result.rows[0]?.count ?? 0);
  }
  console.log("tablo satır sayıları:", counts);
}

export async function closeTestConnections(): Promise<void> {
  await closeDb();
  await closeRedis();
}
