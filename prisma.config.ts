import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * The app splits its connection string into LIVE/TEST pairs (see `core/env`),
 * so resolve the one the CLI should use here. Schema commands run against the
 * direct (unpooled) URL.
 */
const isTest = process.env.NODE_ENV === "test";

const url =
  (isTest
    ? (process.env.DIRECT_URL_TEST ?? process.env.DATABASE_URL_TEST)
    : undefined) ??
  process.env.DIRECT_URL_LIVE ??
  process.env.DATABASE_URL_LIVE ??
  "";

export default defineConfig({
  // Folder, not a file: every module owns its own `*.prisma`.
  schema: path.join(import.meta.dirname, "modules"),
  migrations: {
    path: path.join(
      import.meta.dirname,
      "core",
      "database",
      "prisma",
      "migrations",
    ),
  },
  datasource: { url },
});
