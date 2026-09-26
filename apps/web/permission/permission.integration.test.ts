import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { signInAs } from "../../../tests/auth";
import { makeOrganization, makeUser } from "../../../tests/factories";
import { request } from "../../../tests/request";

const app = buildServer();

describe("permission", () => {
  it("oluşturur, getirir ve siler", async () => {
    const { org, token } = await session([
      "permission.get",
      "permission.post",
      "permission.delete",
    ]);
    const created = await request(app, "/organization/permission", {
      method: "POST",
      token,
      body: {
        organization_id: org.id,
        slug: `desk.${randomUUID()}`,
        name: "Kasa",
      },
    });
    expect(created.status).toBe(200);
    const id = idOf(created.body);

    const got = await request(app, `/organization/permission/${id}`, { token });
    expect(got.status).toBe(200);

    const listed = await request(app, "/organization/permission/search", {
      token,
    });
    expect(listed.status).toBe(200);

    const removed = await request(app, `/organization/permission/${id}`, {
      method: "DELETE",
      token,
    });
    expect(removed.status).toBe(200);

    const missing = await request(app, `/organization/permission/${id}`, {
      token,
    });
    expect(missing.status).toBe(404);
  });

  it("kilitli permission güncellenmez", async () => {
    const { org, token } = await session([
      "permission.post",
      "permission.patch",
    ]);
    const created = await request(app, "/organization/permission", {
      method: "POST",
      token,
      body: {
        organization_id: org.id,
        slug: `lock.${randomUUID()}`,
        name: "Kilit",
        is_locked: true,
      },
    });
    expect(created.status).toBe(200);

    const patched = await request(
      app,
      `/organization/permission/${idOf(created.body)}`,
      { method: "PATCH", token, body: { name: "Açık" } },
    );
    expect(patched.status).toBe(403);
    expect(errorCode(patched.body)).toBe("PERMISSION_LOCKED");
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
