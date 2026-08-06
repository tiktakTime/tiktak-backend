import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "../src/generated/zod/index.ts");
let content = readFileSync(filePath, "utf-8");

// Fix transformJsonNull parameter type to accept unknown
content = content.replace(
  "export const transformJsonNull = (v?: NullableJsonInput)",
  "export const transformJsonNull = (v?: unknown)",
);

// Fix toJSON signature in InputJsonValueSchema to match () => unknown strictly without any
content = content.replace(
  /toJSON:\s*z\.any\(\)/g,
  "toJSON: z.custom<() => unknown>()",
);

// Set JsonValueSchema to z.unknown() strictly without any
const regex = /export const JsonValueSchema: z\.ZodType[\s\S]+?\);\n|export const JsonValueSchema = z\.any\(\);\n/;
const replacement = `export const JsonValueSchema = z.unknown();\n`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  writeFileSync(filePath, content, "utf-8");
  console.log("✅ JsonValueSchema patched to z.unknown() without any");
} else {
  console.log("⚠️ JsonValueSchema pattern not found - already patched?");
}

// Patch Kysely generated types for enum arrays
const kyselyFilePath = join(__dirname, "../src/kysely/index.ts");
if (!existsSync(kyselyFilePath)) {
  console.log("⚠️ Kysely index.ts not found - skipping kysely patch");
} else {
  let kyselyContent = readFileSync(kyselyFilePath, "utf-8");

  kyselyContent = kyselyContent.replace(
    /^import type \{ CurrencyCode \} from "\.\/enums\.js";\n/,
    "",
  );

  kyselyContent = kyselyContent.replace(
    /currencies:\s*Generated<string>;/g,
    "currencies: Generated<CurrencyCode[]>;",
  );

  writeFileSync(kyselyFilePath, kyselyContent, "utf-8");
  console.log("✅ Kysely currencies patched to CurrencyCode[]");
}
