import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { InviteStatus, db } from "@/modules/db";
import * as inviteRepo from "@/modules/invite/invite.repo";
import * as personRepo from "@/modules/person/person.repo";
import { buildServer } from "@/server";

import { mailQueue } from "../../../core/queue";
import { signInAs } from "../../../tests/auth";
import {
  makeOrganization,
  makePerson,
  makeUser,
} from "../../../tests/factories";
import { assertInvariants } from "../../../tests/invariants/employee";
import { request } from "../../../tests/request";

const app = buildServer();
const password = "password-1";

describe("davet", () => {
  it("yeni hesap: oluştur, kabul et, tek access", async () => {
    const { org, token } = await adminOrg();
    const email = uniqueEmail();
    const { person, invite } = await openInvite(token, org.id, email);

    const mail = await inviteMail(email);
    expect(mail?.key).toBe("v2:invite");

    const preview = await request(
      app,
      `/invite/by-token?token=${invite.token}`,
    );
    expect(preview.status).toBe(200);
    expect(field(preview.body, "scenario")).toBe("new");
    expect(field(preview.body, "can_accept")).toBe(true);

    const accepted = await request(app, "/invite/accept", {
      body: { token: invite.token, password },
    });
    expect(accepted.status).toBe(200);
    expect(await accessCount(org.id, person.id)).toBe(1);

    const linked = await personRepo.findById(org.id, person.id);
    expect(linked?.status).toBe("active");
    expect(linked?.user_id).toBeTruthy();
    expect((await inviteRepo.findById(org.id, invite.id))?.status).toBe(
      InviteStatus.accepted,
    );

    const again = await request(app, "/invite/accept", {
      body: { token: invite.token, password },
    });
    expect(again.status).toBe(409);
    expect(errorCode(again.body)).toBe("INVITE_ALREADY_ACCEPTED");
    expect(await accessCount(org.id, person.id)).toBe(1);
    await assertInvariants(org.id);
  });

  it("aynı token'a iki eşzamanlı kabul: biri 200, tek access", async () => {
    const { org, token } = await adminOrg();
    const { person, invite } = await openInvite(token, org.id, uniqueEmail());

    const [first, second] = await Promise.all([
      request(app, "/invite/accept", {
        body: { token: invite.token, password },
      }),
      request(app, "/invite/accept", {
        body: { token: invite.token, password },
      }),
    ]);

    expect([first.status, second.status].sort()).toEqual([200, 409]);
    expect([errorCode(first.body), errorCode(second.body)].sort()).toEqual([
      "INVITE_ALREADY_ACCEPTED",
      "invite.accept",
    ]);
    expect(await accessCount(org.id, person.id)).toBe(1);
    await assertInvariants(org.id);
  });

  it("bağlı kullanıcı şifresiz kabul eder", async () => {
    const { org, token } = await adminOrg();
    const email = uniqueEmail();
    const user = await makeUser({ email });
    const person = await makePerson({
      organization_id: org.id,
      email,
      user_id: user.id,
    });
    const created = await request(app, "/organization/invite", {
      method: "POST",
      token,
      body: { person_id: person.id },
    });
    expect(created.status).toBe(200);
    const invite = await inviteRepo.findById(org.id, dataId(created.body));
    if (!invite?.token) throw new Error("token yok");

    const preview = await request(
      app,
      `/invite/by-token?token=${invite.token}`,
    );
    expect(field(preview.body, "scenario")).toBe("existing");

    const accepted = await request(app, "/invite/accept", {
      body: { token: invite.token },
    });
    expect(accepted.status).toBe(200);
    expect(await accessCount(org.id, person.id)).toBe(1);
    await assertInvariants(org.id);
  });

  it("e-postası olmayan kişiye davet açılmaz", async () => {
    const { org, token } = await adminOrg();
    const person = await makePerson({ organization_id: org.id });
    const created = await request(app, "/organization/invite", {
      method: "POST",
      token,
      body: { person_id: person.id },
    });
    expect(created.status).toBe(400);
    expect(errorCode(created.body)).toBe("INVITE_PERSON_EMAIL_MISSING");
    expect(
      await inviteRepo.findPendingByPerson(org.id, person.id),
    ).toBeUndefined();
  });

  it("bekleyen davet varken ikincisi açılmaz", async () => {
    const { org, token } = await adminOrg();
    const { person } = await openInvite(token, org.id, uniqueEmail());
    const again = await request(app, "/organization/invite", {
      method: "POST",
      token,
      body: { person_id: person.id },
    });
    expect(again.status).toBe(409);
    expect(errorCode(again.body)).toBe("INVITE_PENDING_EXISTS");
  });

  it("iptal edilen davet kabul edilmez", async () => {
    const { org, token } = await adminOrg();
    const { invite } = await openInvite(token, org.id, uniqueEmail());
    const canceled = await request(
      app,
      `/organization/invite/${invite.id}/cancel`,
      { method: "POST", token },
    );
    expect(canceled.status).toBe(200);

    const accepted = await request(app, "/invite/accept", {
      body: { token: invite.token, password },
    });
    expect(accepted.status).toBe(400);
    expect(errorCode(accepted.body)).toBe("INVITE_CANCELED");
  });

  it("süresi dolmuş davet kabul edilmez", async () => {
    const { org, token } = await adminOrg();
    const email = uniqueEmail();
    const person = await makePerson({ organization_id: org.id, email });
    const created = await request(app, "/organization/invite", {
      method: "POST",
      token,
      body: {
        person_id: person.id,
        expires_at: new Date(Date.now() - 60_000).toISOString(),
      },
    });
    expect(created.status).toBe(200);
    const invite = await inviteRepo.findById(org.id, dataId(created.body));
    if (!invite?.token) throw new Error("token yok");

    const accepted = await request(app, "/invite/accept", {
      body: { token: invite.token, password },
    });
    expect(accepted.status).toBe(400);
    expect(errorCode(accepted.body)).toBe("INVITE_EXPIRED");
  });

  it("yeniden gönderince eski token düşer", async () => {
    const { org, token } = await adminOrg();
    const { invite } = await openInvite(token, org.id, uniqueEmail());
    const oldToken = invite.token;

    const resent = await request(
      app,
      `/organization/invite/${invite.id}/resend`,
      { method: "POST", token },
    );
    expect(resent.status).toBe(200);
    const next = await inviteRepo.findById(org.id, invite.id);
    expect(next?.token).not.toBe(oldToken);

    const stale = await request(app, `/invite/by-token?token=${oldToken}`);
    expect(stale.status).toBe(404);
    expect(errorCode(stale.body)).toBe("INVITE_NOT_FOUND");

    const fresh = await request(app, `/invite/by-token?token=${next?.token}`);
    expect(fresh.status).toBe(200);
    expect(field(fresh.body, "can_accept")).toBe(true);
  });
});

async function adminOrg() {
  const org = await makeOrganization();
  const actor = await makeUser();
  const token = await signInAs(actor, {
    organization_id: org.id,
    permissions: ["invite.get", "invite.post", "invite.patch"],
  });
  return { org, token };
}

async function openInvite(token: string, orgId: string, email: string) {
  const person = await makePerson({ organization_id: orgId, email });
  const created = await request(app, "/organization/invite", {
    method: "POST",
    token,
    body: { person_id: person.id },
  });
  expect(created.status).toBe(200);
  const invite = await inviteRepo.findById(orgId, dataId(created.body));
  if (!invite?.token) throw new Error("token yok");
  return { person, invite };
}

async function accessCount(orgId: string, personId: string) {
  const rows = await db
    .selectFrom("access")
    .select("id")
    .where("organization_id", "=", orgId)
    .where("person_id", "=", personId)
    .execute();
  return rows.length;
}

async function inviteMail(address: string) {
  const jobs = await mailQueue.getJobs(["waiting", "delayed"]);
  return jobs.find((job) => job.data.mail === address)?.data as
    { key: string; mail: string } | undefined;
}

function uniqueEmail() {
  return `${randomUUID()}@example.test`;
}

function dataId(body: unknown): string {
  const id = field(body, "id");
  if (typeof id !== "string") throw new Error("id yok");
  return id;
}

function field(body: unknown, key: string): unknown {
  if (typeof body !== "object" || body === null || !("data" in body))
    return undefined;
  const data = (body as { data: unknown }).data;
  if (typeof data !== "object" || data === null || !(key in data))
    return undefined;
  return (data as Record<string, unknown>)[key];
}

function errorCode(body: unknown): string {
  if (typeof body !== "object" || body === null || !("code" in body)) return "";
  const code = (body as { code: unknown }).code;
  return typeof code === "string" ? code : "";
}
