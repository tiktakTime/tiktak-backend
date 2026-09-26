import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { signInAs } from "../../../tests/auth";
import { makeOrganization, makeUser } from "../../../tests/factories";
import { assertInvariants } from "../../../tests/invariants/employee";
import { request } from "../../../tests/request";

const app = buildServer();

describe("person", () => {
  it("oluşturur, listeler ve siler", async () => {
    const { org, token } = await session([
      "person.get",
      "person.post",
      "person.delete",
    ]);
    const email = `${randomUUID()}@example.test`;
    const created = await request(app, "/organization/person", {
      method: "POST",
      token,
      body: {
        organization_id: org.id,
        first_name: "Ada",
        last_name: "Lovelace",
        email,
      },
    });
    expect(created.status).toBe(200);
    const id = idOf(created.body);

    const got = await request(app, `/organization/person/${id}`, { token });
    expect(got.status).toBe(200);

    const listed = await request(
      app,
      `/organization/person/search?organization_id=${org.id}`,
      { token },
    );
    expect(listed.status).toBe(200);

    const removed = await request(app, `/organization/person/${id}`, {
      method: "DELETE",
      token,
    });
    expect(removed.status).toBe(200);

    const missing = await request(app, `/organization/person/${id}`, { token });
    expect(missing.status).toBe(404);
    expect(errorCode(missing.body)).toBe("PERSON_NOT_FOUND");
    await assertInvariants(org.id);
  });

  it("aynı e-posta ikinci kişiyi açmaz", async () => {
    const { org, token } = await session(["person.post"]);
    const email = `${randomUUID()}@example.test`;
    const body = {
      organization_id: org.id,
      first_name: "Ada",
      last_name: "Lovelace",
      email,
    };
    const first = await request(app, "/organization/person", {
      method: "POST",
      token,
      body,
    });
    expect(first.status).toBe(200);

    const second = await request(app, "/organization/person", {
      method: "POST",
      token,
      body,
    });
    expect(second.status).toBe(409);
    expect(errorCode(second.body)).toBe("EMAIL_ALREADY_EXISTS");
  });
});

async function session(permissions: string[]) {
  const org = await makeOrganization();
  const user = await makeUser();
  const token = await signInAs(user, {
    organization_id: org.id,
    permissions,
  });
  return { org, token };
}

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
