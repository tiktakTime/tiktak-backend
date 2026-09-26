import { describe, expect, it } from "vitest";

import { app_config } from "@/app.config";
import { buildServer } from "@/server";

import { request } from "./request";

describe("OpenAPI", () => {
  it("spec snapshot ile kilitli", async () => {
    const app = buildServer();
    const response = await request(app, app_config.openapi.spec_path);
    expect(response.status).toBe(200);
    expect(response.body).toMatchSnapshot();
  });
});
