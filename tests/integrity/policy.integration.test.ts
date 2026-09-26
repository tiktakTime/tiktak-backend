import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

import * as employeeRepo from "@/modules/employee/employee.repo";
import * as permissionRepo from "@/modules/permission/permission.repo";
import * as roleRepo from "@/modules/role/role.repo";
import { buildServer } from "@/server";

import { listRegisteredRoutes } from "../../core/http/slice";
import { signInAs } from "../auth";
import { makeOrganization, makePerson, makeUser } from "../factories";
import { request } from "../request";

const app = buildServer();
const ID = "00000000-0000-4000-8000-000000000001";

const gated = listRegisteredRoutes()
  .filter((route) => (route.policy?.length ?? 0) > 0)
  .map((route) => ({
    name: route.name,
    method: route.method.toUpperCase(),
    path: route.path.replace(/\{[^}]+\}/g, ID),
    policy: route.policy ?? [],
  }));

const searches = gated.filter((route) => route.path.endsWith("/search"));

describe("yetki matrisi", () => {
  it("policy'si olan uç var", () => {
    expect(gated.length).toBeGreaterThan(0);
    expect(searches.length).toBeGreaterThan(0);
  });

  it.each(gated)("$method $path anonim 401", async (route) => {
    const response = await request(app, route.path, { method: route.method });
    expect(response.status).toBe(401);
    expect(errorCode(response.body)).toBe("MISSING_BEARER");
  });

  describe("oturum", () => {
    let denied = "";
    let admin = "";

    beforeEach(async () => {
      const org = await makeOrganization();
      const user = await makeUser();
      denied = await signInAs(user, {
        organization_id: org.id,
        permissions: [],
      });
      admin = await signInAs(user, {
        organization_id: org.id,
        permissions: [],
        is_super_admin: true,
      });
    });

    it.each(gated)("$method $path yetkisiz üye 403", async (route) => {
      const response = await call(route, denied);
      expect(response.status).toBe(403);
      expect(errorCode(response.body)).toBe("FORBIDDEN");
    });

    it.each(gated)(
      "$method $path süper admin izin kontrolünü geçer",
      async (route) => {
        const response = await call(route, admin);
        expect(response.status).not.toBe(403);
        expect(errorCode(response.body)).not.toBe("FORBIDDEN");
      },
    );
  });

  it("yetkili üye aramaları 200", async () => {
    const org = await makeOrganization();
    const user = await makeUser();
    const token = await signInAs(user, {
      organization_id: org.id,
      permissions: [...new Set(searches.flatMap((route) => route.policy))],
    });

    for (const route of searches) {
      const response = await call(route, token, org.id);
      expect(response.status, route.name).toBe(200);
    }
  });

  it("süper admin aramaları 200", async () => {
    const org = await makeOrganization();
    const user = await makeUser();
    const token = await signInAs(user, {
      organization_id: org.id,
      is_super_admin: true,
    });

    for (const route of searches) {
      const response = await call(route, token, org.id);
      expect(response.status, route.name).toBe(200);
    }
  });

  it("başka org person kaydını görmez", async () => {
    const orgA = await makeOrganization();
    const orgB = await makeOrganization();
    const person = await makePerson({ organization_id: orgA.id });
    const user = await makeUser();
    const foreign = await signInAs(user, {
      organization_id: orgB.id,
      permissions: ["person.get"],
    });
    const owner = await signInAs(user, {
      organization_id: orgA.id,
      permissions: ["person.get"],
    });

    const hidden = await request(app, `/organization/person/${person.id}`, {
      token: foreign,
    });
    expect(hidden.status).toBe(404);

    const visible = await request(app, `/organization/person/${person.id}`, {
      token: owner,
    });
    expect(visible.status).toBe(200);

    const listed = await request(
      app,
      `/organization/person/search?organization_id=${orgB.id}`,
      { token: foreign },
    );
    expect(listed.status).toBe(200);
    expect(rowIds(listed.body)).not.toContain(person.id);
  });

  it("başka org employee kaydını görmez", async () => {
    const orgA = await makeOrganization();
    const orgB = await makeOrganization();
    const person = await makePerson({ organization_id: orgA.id });
    const employee = await employeeRepo.insert({
      organization_id: orgA.id,
      person_id: person.id,
    });
    const user = await makeUser();
    const foreign = await signInAs(user, {
      organization_id: orgB.id,
      permissions: ["employee.get"],
    });

    const hidden = await request(app, `/organization/employee/${employee.id}`, {
      token: foreign,
    });
    expect(hidden.status).toBe(404);

    const listed = await request(
      app,
      `/organization/employee/search?organization_id=${orgB.id}`,
      { token: foreign },
    );
    expect(listed.status).toBe(200);
    expect(rowIds(listed.body)).not.toContain(employee.id);
  });

  it("başka org rolünü okuyamaz ve değiştiremez", async () => {
    const orgA = await makeOrganization();
    const orgB = await makeOrganization();
    const role = await roleRepo.insert(orgA.id, {
      name: `Rol ${randomUUID()}`,
    });
    const user = await makeUser();
    const foreign = await signInAs(user, {
      organization_id: orgB.id,
      permissions: ["role.get", "role.patch", "role.delete"],
    });

    const hidden = await request(app, `/organization/role/${role.id}`, {
      token: foreign,
    });
    expect(hidden.status).toBe(404);

    const patched = await request(app, `/organization/role/${role.id}`, {
      method: "PATCH",
      token: foreign,
      body: { name: "ele geçirildi" },
    });
    expect(patched.status).toBe(404);
    expect((await roleRepo.findById(orgA.id, role.id))?.name).toBe(role.name);

    const removed = await request(app, `/organization/role/${role.id}`, {
      method: "DELETE",
      token: foreign,
    });
    expect(removed.status).toBe(404);
    expect((await roleRepo.findById(orgA.id, role.id))?.id).toBe(role.id);

    const listed = await request(app, "/organization/role/search", {
      token: foreign,
    });
    expect(rowIds(listed.body)).not.toContain(role.id);
  });

  it("başka org permission kaydını okuyamaz ve değiştiremez", async () => {
    const orgA = await makeOrganization();
    const orgB = await makeOrganization();
    const permission = await permissionRepo.insert(orgA.id, {
      slug: `perm.${randomUUID()}`,
      name: "Gizli",
    });
    const user = await makeUser();
    const foreign = await signInAs(user, {
      organization_id: orgB.id,
      permissions: ["permission.get", "permission.patch", "permission.delete"],
    });

    const hidden = await request(
      app,
      `/organization/permission/${permission.id}`,
      { token: foreign },
    );
    expect(hidden.status).toBe(404);

    const patched = await request(
      app,
      `/organization/permission/${permission.id}`,
      {
        method: "PATCH",
        token: foreign,
        body: { name: "ele geçirildi" },
      },
    );
    expect(patched.status).toBe(404);
    expect((await permissionRepo.findById(orgA.id, permission.id))?.name).toBe(
      permission.name,
    );

    const removed = await request(
      app,
      `/organization/permission/${permission.id}`,
      { method: "DELETE", token: foreign },
    );
    expect(removed.status).toBe(404);
    expect((await permissionRepo.findById(orgA.id, permission.id))?.id).toBe(
      permission.id,
    );
  });

  it.todo("organization.get başka org kaydını gizlemeli mi?");
});

function call(
  route: { method: string; path: string },
  token: string,
  orgId?: string,
): ReturnType<typeof request> {
  const hasBody = route.method !== "GET" && route.method !== "DELETE";
  const path =
    orgId &&
    (route.path.endsWith("/person/search") ||
      route.path.endsWith("/employee/search"))
      ? `${route.path}?organization_id=${orgId}`
      : route.path;
  return request(app, path, {
    method: route.method,
    token,
    body: hasBody ? {} : undefined,
  });
}

function errorCode(body: unknown): string {
  if (typeof body !== "object" || body === null || !("code" in body)) return "";
  const code = (body as { code: unknown }).code;
  return typeof code === "string" ? code : "";
}

function rowIds(body: unknown): string[] {
  if (typeof body !== "object" || body === null || !("data" in body)) return [];
  const data = (body as { data: unknown }).data;
  if (!Array.isArray(data)) return [];
  return data.flatMap((row) => {
    if (typeof row !== "object" || row === null || !("id" in row)) return [];
    const id = (row as { id: unknown }).id;
    return typeof id === "string" ? [id] : [];
  });
}
