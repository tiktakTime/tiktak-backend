import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { request } from "./request";

describe("test altyapısı", () => {
  it("health 200 döner", async () => {
    const app = buildServer();
    const health = await request(app, "/health");
    expect(health.status).toBe(200);
  });
});
