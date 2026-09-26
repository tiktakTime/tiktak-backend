import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { ERROR_META } from "../../platform/i18n/catalog.meta";
import deErrors from "../../platform/i18n/de/errors.json";
import deSuccess from "../../platform/i18n/de/success.json";
import enErrors from "../../platform/i18n/en/errors.json";
import enSuccess from "../../platform/i18n/en/success.json";
import trErrors from "../../platform/i18n/tr/errors.json";
import trSuccess from "../../platform/i18n/tr/success.json";

const root = path.resolve(import.meta.dirname, "../..");

function keys(value: object): string[] {
  return Object.keys(value).sort();
}

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "generated") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(full));
    else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("hata ve başarı katalogları", () => {
  it("ERROR_META anahtarları en/tr/de errors.json ile aynı", () => {
    const en = keys(enErrors);
    expect(keys(ERROR_META)).toEqual(en);
    expect(keys(trErrors)).toEqual(en);
    expect(keys(deErrors)).toEqual(en);
  });

  it("en/tr/de success.json anahtarları aynı", () => {
    const en = keys(enSuccess);
    expect(keys(trSuccess)).toEqual(en);
    expect(keys(deSuccess)).toEqual(en);
  });

  it("koddaki AppError kodları ERROR_META içinde", () => {
    const known = new Set(Object.keys(ERROR_META));
    const used = new Set<string>();
    const pattern = /new AppError\(\s*["']([A-Z0-9_]+)["']/g;

    for (const folder of [
      "apps",
      "modules",
      "platform",
      "core",
      "middlewares",
      "server",
    ]) {
      for (const file of walkTs(path.join(root, folder))) {
        const source = readFileSync(file, "utf8");
        for (const match of source.matchAll(pattern)) {
          const code = match[1];
          if (code) used.add(code);
        }
      }
    }

    const missing = [...used].filter((code) => !known.has(code)).sort();
    expect(missing).toEqual([]);
  });
});
