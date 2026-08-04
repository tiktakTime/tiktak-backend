import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

function buildDatabaseUrl(params: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}) {
  const encodedPassword = encodeURIComponent(params.password);
  return `postgresql://${params.user}:${encodedPassword}@${params.host}:${params.port}/${params.database}`;
}

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().default(3001),
    PG_HOST: z.string().min(1),
    PG_PORT: z.coerce.number().default(5432),
    PG_USER: z.string().min(1),
    PG_PASS: z.string().min(1),
    PG_DB_LIVE: z.string().min(1),
    PG_DB_TEST: z.string().min(1),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

export function getDatabaseName() {
  return env.NODE_ENV === "development" ? env.PG_DB_TEST : env.PG_DB_LIVE;
}

export function getDatabaseUrl() {
  return buildDatabaseUrl({
    host: env.PG_HOST,
    port: env.PG_PORT,
    user: env.PG_USER,
    password: env.PG_PASS,
    database: getDatabaseName(),
  });
}
