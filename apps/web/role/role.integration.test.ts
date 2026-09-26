import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { signInAs } from "../../../tests/auth";
import { makeOrganization, makeUser } from "../../../tests/factories";
import { request } from "../../../tests/request";

const app = buildServer();

describe("role", () => {
  it("oluşturur, getirir, günceller ve siler", async () => {
    const { org, token } = await session([
      "role.get",
      "role.post",
      "role.patch",
      "role.delete",
    ]);

    const created = await request(app, "/organization/role", {
      method: "POST",
      token,
      body: { organization_id: org.id, name: "Kasiyer" },
    });
    expect(created.status).toBe(200);
    const id = idOf(created.body);

    const got = await request(app, `/organization/role/${id}`, { token });
    expect(got.status).toBe(200);

    const listed = await request(app, "/organization/role/search", { token });
    expect(listed.status).toBe(200);

    const patched = await request(app, `/organization/role/${id}`, {
      method: "PATCH",
      token,
      body: { name: "Müdür" },
    });
    expect(patched.status).toBe(200);

    const removed = await request(app, `/organization/role/${id}`, {
      method: "DELETE",
      token,
    });
    expect(removed.status).toBe(200);

    const missing = await request(app, `/organization/role/${id}`, { token });
    expect(missing.status).toBe(404);
    expect(errorCode(missing.body)).toBe("ROLE_NOT_FOUND");
  });

  it("kilitli rol güncellenmez", async () => {
    const { org, token } = await session(["role.post", "role.patch"]);
    const created = await request(app, "/organization/role", {
      method: "POST",
      token,
      body: { organization_id: org.id, name: "Kilit", is_locked: true },
    });
    expect(created.status).toBe(200);

    const patched = await request(
      app,
      `/organization/role/${idOf(created.body)}`,
      {
        method: "PATCH",
        token,
        body: { name: "Açık" },
      },
    );
    expect(patched.status).toBe(403);
    expect(errorCode(patched.body)).toBe("ROLE_LOCKED");
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
