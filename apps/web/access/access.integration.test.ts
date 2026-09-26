import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { signInAs } from "../../../tests/auth";
import {
  makeOrganization,
  makePerson,
  makeUser,
} from "../../../tests/factories";
import { request } from "../../../tests/request";

const app = buildServer();

describe("access", () => {
  it("kullanıcıya org erişimi açar ve getirir", async () => {
    const org = await makeOrganization();
    const actor = await makeUser();
    const member = await makeUser();
    const person = await makePerson({ organization_id: org.id });
    const token = await signInAs(actor, {
      organization_id: org.id,
      permissions: ["access.get", "access.post"],
    });

    const created = await request(app, "/organization/access", {
      method: "POST",
      token,
      body: {
        organization_id: org.id,
        user_id: member.id,
        person_id: person.id,
      },
    });
    expect(created.status).toBe(200);
    const id = idOf(created.body);

    const got = await request(app, `/organization/access/${id}`, { token });
    expect(got.status).toBe(200);

    const listed = await request(app, "/organization/access/search", { token });
    expect(listed.status).toBe(200);
  });
});

function idOf(body: unknown): string {
  const id = (body as { data?: { id?: string } }).data?.id;
  if (!id) throw new Error("id yok");
  return id;
}
