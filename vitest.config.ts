import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

process.env.NODE_ENV = "test";
process.env.SKIP_ENV_VALIDATION ??= "1";
if (existsSync(path.join(root, ".env.local"))) {
  loadEnvFile(path.join(root, ".env.local"));
}

/** Geliştirme Redis'i (db 0) testte flush edilmesin. */
function testRedisUrl(raw: string | undefined): string {
  const url = new URL(raw && raw.length > 0 ? raw : "redis://localhost:6379");
  url.pathname = "/15";
  return url.toString();
}

const shared = {
  resolve: { alias: { "@": root } },
  test: {
    environment: "node" as const,
    exclude: ["node_modules", "**/generated/**"],
  },
};

export default defineConfig({
  test: {
    projects: [
      {
        ...shared,
        test: {
          ...shared.test,
          name: "unit",
          include: ["**/*.test.ts"],
          exclude: [...shared.test.exclude, "**/*.integration.test.ts"],
          env: {
            SKIP_ENV_VALIDATION: "1",
            NODE_ENV: "test",
          },
        },
      },
      {
        ...shared,
        test: {
          ...shared.test,
          name: "integration",
          include: ["**/*.integration.test.ts"],
          globalSetup: ["./tests/global-setup.ts"],
          setupFiles: ["./tests/setup.ts"],
          fileParallelism: false,
          hookTimeout: 30_000,
          testTimeout: 30_000,
          env: {
            SKIP_ENV_VALIDATION: "1",
            NODE_ENV: "test",
            REDIS_URL: testRedisUrl(process.env.REDIS_URL),
            ACCESS_TOKEN_TTL_SECONDS:
              process.env.ACCESS_TOKEN_TTL_SECONDS ?? "900",
            REFRESH_TOKEN_TTL_SECONDS:
              process.env.REFRESH_TOKEN_TTL_SECONDS ?? "2592000",
          },
        },
      },
    ],
  },
});
