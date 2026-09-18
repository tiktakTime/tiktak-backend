import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Only variables the code actually reads are declared here.
 * Add a variable when the feature that consumes it lands, not before.
 */
const raw = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().default(3001),
    /** HTTP mount prefix (gateway maps /api and /api-test onto this). */
    API_BASE_PATH: z
      .string()
      .default("/api")
      .transform((value) => {
        const trimmed = value.trim() || "/api";
        const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
        return withSlash.replace(/\/+$/, "") || "/api";
      }),
    DATABASE_URL_LIVE: z.url(),
    DATABASE_URL_TEST: z.url().optional(),
    DIRECT_URL_LIVE: z.url().optional(),
    DIRECT_URL_TEST: z.url().optional(),
    /** Redis for response cache, sessions, rate-limit, BullMQ. */
    REDIS_URL: z.string().default("redis://localhost:6379"),
    /** HS256 secret for access JWTs (jose). */
    JWT_SECRET: z.string().min(16).default("dev-only-change-me-jwt-secret"),
    ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    REFRESH_TOKEN_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(60 * 60 * 24 * 30),
    /** Comma-separated Google OAuth client IDs (web / iOS / Android). */
    GOOGLE_CLIENT_IDS: z.string().optional(),
    /** Comma-separated Apple Services IDs / bundle IDs (aud). */
    APPLE_CLIENT_IDS: z.string().optional(),
    /** MinIO / S3 endpoint (optional until file upload is used). */
    S3_ENDPOINT: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    /** Public base URL for stored objects (e.g. http://localhost:9000/assets). */
    S3_URL: z.string().optional(),
    /** Frontend base URL for verification / invite mail links. */
    WEB_BASE_URL: z.url(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

const isTest = raw.NODE_ENV === "test";

export const env = {
  ...raw,
  /** Pooled connection used by the running app. */
  DATABASE_URL: isTest
    ? (raw.DATABASE_URL_TEST ?? raw.DATABASE_URL_LIVE)
    : raw.DATABASE_URL_LIVE,
  /** Unpooled connection used by migrations and seeds. */
  DIRECT_URL: isTest
    ? (raw.DIRECT_URL_TEST ??
      raw.DATABASE_URL_TEST ??
      raw.DIRECT_URL_LIVE ??
      raw.DATABASE_URL_LIVE)
    : (raw.DIRECT_URL_LIVE ?? raw.DATABASE_URL_LIVE),
};
