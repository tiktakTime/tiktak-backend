import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const mode = process.argv[2]; // "local" | "remote"

if (mode !== "local" && mode !== "remote") {
  console.error("Usage: node scripts/ensure-env.mjs <local|remote>");
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** local → .env.local · remote → .env */
const targetName = mode === "local" ? ".env.local" : ".env";
const exampleName =
  mode === "local" ? ".env.local.example" : ".env.example";

const target = resolve(root, targetName);
const example = resolve(root, exampleName);

if (existsSync(target)) {
  process.exit(0);
}

if (!existsSync(example)) {
  console.error(`❌ Missing template: ${exampleName}`);
  process.exit(1);
}

copyFileSync(example, target);
console.log(`📄 Created ${targetName} from ${exampleName}`);
console.log(`   Edit passwords/hosts if needed, then re-run.\n`);
