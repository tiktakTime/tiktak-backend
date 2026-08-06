import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { expand } from "dotenv-expand";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const databaseDir = path.join(repoRoot, "packages/database");

// Deploy image carries branch-specific `.env` (test vs main).
expand(loadEnv({ path: path.join(repoRoot, ".env") }));

if (process.env.SKIP_DB_MIGRATE !== "1") {
  console.log("Applying database migrations (prisma migrate deploy)...");
  const result = spawnSync("pnpm", ["run", "db:deploy"], {
    cwd: databaseDir,
    env: process.env,
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    console.error("Database migration failed; refusing to start.");
    process.exit(result.status ?? 1);
  }
}

await import("../src/index.ts");
