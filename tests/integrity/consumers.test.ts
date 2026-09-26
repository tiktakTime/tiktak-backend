import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "generated") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

function sliceOf(file: string): string | null {
  const relative = path.relative(root, file).split(path.sep);
  const index = relative.indexOf("apps");
  if (index < 0 || relative.length < index + 2) return null;
  const surface = relative[index + 1];
  const next = relative[index + 2];
  if (!surface) return null;
  if (!next || next.endsWith(".ts")) return `apps/${surface}`;
  return `apps/${surface}/${next}`;
}

function readDoc(docPath: string): string {
  try {
    return readFileSync(docPath, "utf8");
  } catch {
    return "";
  }
}

function consumersOf(moduleName: string, appFiles: string[]): Set<string> {
  const pattern = new RegExp(`@/modules/${moduleName}(?:/|["'])`);
  const consumers = new Set<string>();
  for (const file of appFiles) {
    if (!pattern.test(readFileSync(file, "utf8"))) continue;
    const slice = sliceOf(file);
    if (slice) consumers.add(slice);
  }
  return consumers;
}

function missingForModule(moduleName: string, appFiles: string[]): string[] {
  const consumers = consumersOf(moduleName, appFiles);
  if (consumers.size === 0) return [];

  const doc = readDoc(path.join(root, "modules", moduleName, "doc.md"));
  if (!doc.includes("## Tüketiciler")) {
    return [`${moduleName}: Tüketiciler bölümü yok`];
  }

  const section = doc.split("## Tüketiciler")[1]?.split("\n## ")[0] ?? "";
  return [...consumers]
    .filter((consumer) => !section.includes(consumer))
    .map((consumer) => `${moduleName} ← ${consumer}`);
}

describe("modül doc Tüketiciler", () => {
  it("apps içinden import edilen her modül dokümanda geçiyor", () => {
    const modulesDir = path.join(root, "modules");
    const appFiles = walk(path.join(root, "apps"));
    const missing = readdirSync(modulesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => missingForModule(entry.name, appFiles));

    expect(missing).toEqual([]);
  });
});
