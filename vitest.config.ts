import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
    },
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules", "**/generated/**"],
    environment: "node",
    /**
     * `core/env` import anında doğrulama yapar; testler gerçek secret
     * istemesin. Env'e bağlı modülleri test edebilmek için tek kapı.
     */
    env: {
      SKIP_ENV_VALIDATION: "1",
      NODE_ENV: "test",
    },
  },
});
