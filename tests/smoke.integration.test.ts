import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { signInAs } from "./auth";
import {
  makeAccess,
  makeOrganization,
  makePerson,
  makeUser,
} from "./factories";
import { assertInvariants } from "./invariants/employee";
import { request } from "./request";

describe("test altyapısı", () => {
  it("health 200 döner, fabrika ve oturum değişmezleri bozmaz", async () => {
    const app = buildServer();
    const health = await request(app, "/health");
    expect(health.status).toBe(200);

    const user = await makeUser();
    const organization = await makeOrganization({ owner_id: user.id });
    const person = await makePerson({ organization_id: organization.id });
    await makeAccess({
      organization_id: organization.id,
      user_id: user.id,
      person_id: person.id,
    });

    const token = await signInAs(user, {
      organization_id: organization.id,
      person_id: person.id,
    });
    expect(token.length).toBeGreaterThan(20);

    const member = await request(app, "/auth/member", { token });
    expect(member.status).toBe(200);

    await assertInvariants(organization.id);
  });
});
