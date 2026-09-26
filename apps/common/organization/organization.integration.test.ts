import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { signInAs } from "../../../tests/auth";
import { makeOrganization, makeUser } from "../../../tests/factories";
import { request } from "../../../tests/request";

const app = buildServer();

describe("organization", () => {
  it("oluşturur, getirir ve aynı adı reddeder", async () => {
    const home = await makeOrganization();
    const actor = await makeUser();
    const token = await signInAs(actor, {
      organization_id: home.id,
      permissions: ["organization.get"],
    });
    const company_name = `Org ${randomUUID()}`;
    const body = {
      company_name,
      business_type: "sole_proprietorship",
    };

    const created = await request(app, "/organization", {
      method: "POST",
      token,
      body,
    });
    expect(created.status).toBe(200);
    const id = idOf(created.body);

    const got = await request(app, `/organization/${id}`, { token });
    expect(got.status).toBe(200);

    const listed = await request(app, "/organization/search", { token });
    expect(listed.status).toBe(200);

    const duplicate = await request(app, "/organization", {
      method: "POST",
      token,
      body,
    });
    expect(duplicate.status).toBe(409);
    expect(errorCode(duplicate.body)).toBe("ORGANIZATION_NAME_EXISTS");
  });
});

function idOf(body: unknown): string {
  const id = (body as { data?: { id?: string } }).data?.id;
  if (!id) throw new Error("id yok");
  return id;
}

function errorCode(body: unknown): string {
  if (typeof body !== "object" || body === null || !("code" in body)) return "";
  const code = (body as { code: unknown }).code;
  return typeof code === "string" ? code : "";
}
