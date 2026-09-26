import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { listRegisteredRoutes } from "../../core/http/slice";
import enSuccess from "../../platform/i18n/en/success.json";

const SEGMENT = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const PARAM = /^\{[a-z][a-z0-9_]*\}$/;

describe("route sözleşmesi", () => {
  it("her tenant kayıtlı bir scope ve mutation adı success.json içinde", () => {
    expect(() => buildServer()).not.toThrow();

    const routes = listRegisteredRoutes();
    expect(routes.length).toBeGreaterThan(0);

    const success = new Set(Object.keys(enSuccess));
    const missing = routes
      .filter((route) => route.method !== "get")
      .map((route) => route.name)
      .filter((name) => !success.has(name));

    expect(missing).toEqual([]);
  });

  it("path segmentleri küçük harf; camelCase yok", () => {
    const bad: string[] = [];
    for (const route of listRegisteredRoutes()) {
      for (const segment of route.path.split("/")) {
        if (segment.length === 0) continue;
        if (PARAM.test(segment) || SEGMENT.test(segment)) continue;
        bad.push(`${route.name} ${route.path}`);
        break;
      }
    }
    expect(bad).toEqual([]);
  });

  it("okunan her cache tag bir mutation tarafından purge ediliyor", () => {
    const read = new Set<string>();
    const purge = new Set<string>();
    for (const route of listRegisteredRoutes()) {
      for (const tag of route.cache?.read?.tags ?? []) read.add(tag);
      for (const tag of route.cache?.write?.purge ?? []) purge.add(tag);
    }

    const stale = [...read].filter((tag) => !purge.has(tag)).sort();
    expect(stale).toEqual([]);
  });
});
