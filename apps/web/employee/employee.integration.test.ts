import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { signInAs } from "../../../tests/auth";
import {
  makeOrganization,
  makePerson,
  makeUser,
} from "../../../tests/factories";
import { assertInvariants } from "../../../tests/invariants/employee";
import { request } from "../../../tests/request";

const app = buildServer();

describe("employee", () => {
  it("kişiye bir employee açar ve numarayı ayırır", async () => {
    const { org, token } = await session([
      "employee.get",
      "employee.post",
      "employee.delete",
    ]);
    const person = await makePerson({ organization_id: org.id });
    const created = await request(app, "/organization/employee", {
      method: "POST",
      token,
      body: { organization_id: org.id, person_id: person.id, employee_no: 7 },
    });
    expect(created.status).toBe(200);
    const id = idOf(created.body);
    expect(numberOf(created.body, "employee_no")).toBe(7);

    const got = await request(app, `/organization/employee/${id}`, { token });
    expect(got.status).toBe(200);

    const listed = await request(
      app,
      `/organization/employee/search?organization_id=${org.id}`,
      { token },
    );
    expect(listed.status).toBe(200);

    const again = await request(app, "/organization/employee", {
      method: "POST",
      token,
      body: { organization_id: org.id, person_id: person.id },
    });
    expect(again.status).toBe(409);
    expect(errorCode(again.body)).toBe("EMPLOYEE_ALREADY_EXISTS");

    const other = await makePerson({ organization_id: org.id });
    const taken = await request(app, "/organization/employee", {
      method: "POST",
      token,
      body: { organization_id: org.id, person_id: other.id, employee_no: 7 },
    });
    expect(taken.status).toBe(409);
    expect(errorCode(taken.body)).toBe("EMPLOYEE_NO_IN_USE");

    const removed = await request(app, `/organization/employee/${id}`, {
      method: "DELETE",
      token,
    });
    expect(removed.status).toBe(200);
    await assertInvariants(org.id);
  });

  it("sıradaki numara bir sayı döner", async () => {
    const { org, token } = await session(["employee.get"]);
    const next = await request(
      app,
      `/organization/employee/get-next-employee-no?organization_id=${org.id}`,
      { token },
    );
    expect(next.status).toBe(200);
    expect(typeof numberOf(next.body, "employee_no")).toBe("number");
  });

  it.todo(
    "person_id + user_id + email birlikte gelirse: sessiz öncelik mi, çelişki hatası mı?",
  );
  it.todo(
    "soft-delete edilmiş blocked person, creator ile restore edilince active olmalı mı?",
  );
  it.todo("employee_no sil/geri-ekle sonrası korunmalı mı, yeni mi verilmeli?");
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

function numberOf(body: unknown, key: string): number {
  const value = (body as { data?: Record<string, unknown> }).data?.[key];
  if (typeof value !== "number") throw new Error(`${key} yok`);
  return value;
}

function errorCode(body: unknown): string {
  if (typeof body !== "object" || body === null || !("code" in body)) return "";
  const code = (body as { code: unknown }).code;
  return typeof code === "string" ? code : "";
}
