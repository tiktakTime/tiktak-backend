import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const raw = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL_LIVE: z.string().url(),
    DATABASE_URL_TEST: z.string().url().optional(),
    DIRECT_URL_LIVE: z.string().url().optional(),
    DIRECT_URL_TEST: z.string().url().optional(),
    PORT: z.coerce.number().default(3001),
    /** HTTP mount prefix for the API (gateway /api and /api-test → /api). */
    API_BASE_PATH: z
      .string()
      .default("/api")
      .transform((v) => {
        const trimmed = v.trim() || "/api";
        const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
        return withSlash.replace(/\/+$/, "") || "/api";
      }),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    // Optional until Faz 1 (jose + Redis session); starter auth still reads it.
    FIREBASE_PROJECT_ID: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

const isTest = raw.NODE_ENV === "test";

export const env = {
  ...raw,
  /** Active app connection (test → TEST, otherwise LIVE). */
  DATABASE_URL: isTest
    ? (raw.DATABASE_URL_TEST ?? raw.DATABASE_URL_LIVE)
    : raw.DATABASE_URL_LIVE,
  /** Active direct/migrate connection. */
  DIRECT_URL: isTest
    ? (raw.DIRECT_URL_TEST ?? raw.DATABASE_URL_TEST ?? raw.DIRECT_URL_LIVE ?? raw.DATABASE_URL_LIVE)
    : (raw.DIRECT_URL_LIVE ?? raw.DATABASE_URL_LIVE),
};
