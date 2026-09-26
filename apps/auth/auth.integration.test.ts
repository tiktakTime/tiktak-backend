import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/modules/db";
import { UserStatus } from "@/modules/db";
import * as userRepo from "@/modules/user/user.repo";
import * as identityRepo from "@/modules/user_identity/user_identity.repo";
import { buildServer } from "@/server";

import { mailQueue } from "../../core/queue";
import {
  makeAccess,
  makeOrganization,
  makePerson,
} from "../../tests/factories";
import { request } from "../../tests/request";
import type { OAuthClaims } from "./domain/oauth";

const verifyOAuthIdToken = vi.hoisted(() => vi.fn());

vi.mock("./domain", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./domain")>();
  return { ...actual, verifyOAuthIdToken };
});

const app = buildServer();
const password = "secret-1";

type Envelope<T> = {
  status: string;
  code: string;
  data: T;
};

function asEnvelope<T>(body: unknown): Envelope<T> {
  return body as Envelope<T>;
}

async function makeActiveUser(email: string) {
  return userRepo.createAuthUser({
    first_name: "Ada",
    last_name: "Lovelace",
    email,
    password: await hash(password, 4),
    status: "active",
    email_verified_at: new Date(),
  });
}

async function tokenOf(email: string, type: "register" | "password_reset") {
  const row = await db
    .selectFrom("verification_code")
    .select("token")
    .where("email", "=", email)
    .where("type", "=", type)
    .where("status", "=", "pending")
    .executeTakeFirst();
  if (!row?.token) throw new Error(`token yok: ${type} ${email}`);
  return row.token;
}

async function mailFor(address: string) {
  const jobs = await mailQueue.getJobs(["waiting", "delayed"]);
  const job = jobs.find((item) => item.data.mail === address);
  return job?.data as
    { key: string; mail: string; payload: { token?: string } } | undefined;
}

beforeEach(() => {
  verifyOAuthIdToken.mockReset();
});

describe("signUpUser", () => {
  it("1–7. kayıt inactive kullanıcı açar ve doğrulama mailini kuyruğa koyar", async () => {
    const email = `${randomUUID()}@example.test`;
    const response = await request(app, "/auth/sign-up", {
      body: {
        first_name: "Ada",
        last_name: "Lovelace",
        email,
        password,
      },
    });

    expect(response.status).toBe(200);
    const body = asEnvelope<{ status: string; email: string }>(response.body);
    expect(body.code).toBe("auth.sign-up");
    expect(body.data.status).toBe("inactive");
    expect(body.data.email).toBe(email);

    const token = await tokenOf(email, "register");
    const mail = await mailFor(email);
    expect(mail?.key).toBe("v2:verifyEmail");
    expect(mail?.payload.token).toContain(token);

    const signIn = await request(app, "/auth/sign-in", {
      body: { email, password },
    });
    expect(signIn.status).toBe(403);
    expect(asEnvelope<unknown>(signIn.body).code).toBe("USER_INACTIVE");
  });

  it("2. aynı e-posta EMAIL_ALREADY_EXISTS ve ikinci kullanıcı yazılmaz", async () => {
    const email = `${randomUUID()}@example.test`;
    await request(app, "/auth/sign-up", {
      body: { first_name: "Ada", last_name: "Lovelace", email, password },
    });
    const again = await request(app, "/auth/sign-up", {
      body: { first_name: "Ada", last_name: "Lovelace", email, password },
    });

    expect(again.status).toBe(409);
    expect(asEnvelope<unknown>(again.body).code).toBe("EMAIL_ALREADY_EXISTS");

    const rows = await db
      .selectFrom("user")
      .select("id")
      .where("email", "=", email)
      .execute();
    expect(rows).toHaveLength(1);
  });
});

describe("verifyEmail", () => {
  it("doğrulama kullanıcıyı aktif eder ve giriş token çifti döner", async () => {
    const email = `${randomUUID()}@example.test`;
    await request(app, "/auth/sign-up", {
      body: { first_name: "Ada", last_name: "Lovelace", email, password },
    });
    const token = await tokenOf(email, "register");

    const verified = await request(app, "/auth/verify-email", {
      body: { token },
    });
    expect(verified.status).toBe(200);
    expect(asEnvelope<{ ok: boolean }>(verified.body).data.ok).toBe(true);

    const signIn = await request(app, "/auth/sign-in", {
      body: { email, password },
    });
    expect(signIn.status).toBe(200);
    const pair = asEnvelope<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>(signIn.body).data;
    expect(pair.token_type).toBe("Bearer");
    expect(pair.access_token.length).toBeGreaterThan(20);
    expect(pair.refresh_token.length).toBeGreaterThan(20);
  });
});

describe("authenticateUser", () => {
  it("5. yanlış şifre INVALID_CREDENTIALS", async () => {
    const email = `${randomUUID()}@example.test`;
    await makeActiveUser(email);
    const response = await request(app, "/auth/sign-in", {
      body: { email, password: "wrong-password" },
    });
    expect(response.status).toBe(401);
    expect(asEnvelope<unknown>(response.body).code).toBe("INVALID_CREDENTIALS");
  });

  it("oturum member bilgisini döner, logout sonrası aynı token 401", async () => {
    const email = `${randomUUID()}@example.test`;
    await makeActiveUser(email);
    const signIn = await request(app, "/auth/sign-in", {
      body: { email, password },
    });
    const token = asEnvelope<{ access_token: string }>(signIn.body).data
      .access_token;

    const member = await request(app, "/auth/member", { token });
    expect(member.status).toBe(200);
    expect(asEnvelope<{ email: string }>(member.body).data.email).toBe(email);

    const loggedOut = await request(app, "/auth/logout", {
      method: "POST",
      token,
    });
    expect(loggedOut.status).toBe(200);

    const after = await request(app, "/auth/member", { token });
    expect(after.status).toBe(401);
  });
});

describe("forgotPassword / resetPassword", () => {
  it("sıfırlama maili kuyruğa düşer ve yeni şifre ile giriş olur", async () => {
    const email = `${randomUUID()}@example.test`;
    await makeActiveUser(email);

    const asked = await request(app, "/auth/forgot-password", {
      body: { email },
    });
    expect(asked.status).toBe(200);

    const token = await tokenOf(email, "password_reset");
    const mail = await mailFor(email);
    expect(mail?.key).toBe("v2:passwordRecovery");
    expect(mail?.payload.token).toContain(token);

    const next = "new-secret";
    const reset = await request(app, "/auth/reset-password", {
      body: { token, new_password: next },
    });
    expect(reset.status).toBe(200);

    const oldLogin = await request(app, "/auth/sign-in", {
      body: { email, password },
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app, "/auth/sign-in", {
      body: { email, password: next },
    });
    expect(newLogin.status).toBe(200);
  });

  it("olmayan e-posta USER_NOT_FOUND ve mail kuyruğa düşmez", async () => {
    const email = `${randomUUID()}@example.test`;
    const response = await request(app, "/auth/forgot-password", {
      body: { email },
    });
    expect(response.status).toBe(404);
    expect(asEnvelope<unknown>(response.body).code).toBe("USER_NOT_FOUND");
    expect(await mailFor(email)).toBeUndefined();
  });
});

describe("refresh", () => {
  it("tek kullanım yeni çift verir, aynı token ikinci kez INVALID_REFRESH", async () => {
    const email = `${randomUUID()}@example.test`;
    await makeActiveUser(email);
    const signIn = await request(app, "/auth/sign-in", {
      body: { email, password },
    });
    const refreshToken = asEnvelope<{ refresh_token: string }>(signIn.body).data
      .refresh_token;

    const first = await request(app, "/auth/refresh", {
      body: { refresh_token: refreshToken },
    });
    expect(first.status).toBe(200);
    const rotated = asEnvelope<{ refresh_token: string }>(first.body).data
      .refresh_token;
    expect(rotated).not.toBe(refreshToken);

    const second = await request(app, "/auth/refresh", {
      body: { refresh_token: refreshToken },
    });
    expect(second.status).toBe(401);
    expect(asEnvelope<unknown>(second.body).code).toBe("INVALID_REFRESH");
  });

  it("aynı token ile iki eşzamanlı istekten biri kabul, diğeri red", async () => {
    const email = `${randomUUID()}@example.test`;
    await makeActiveUser(email);
    const signIn = await request(app, "/auth/sign-in", {
      body: { email, password },
    });
    const refreshToken = asEnvelope<{ refresh_token: string }>(signIn.body).data
      .refresh_token;

    const [left, right] = await Promise.all([
      request(app, "/auth/refresh", { body: { refresh_token: refreshToken } }),
      request(app, "/auth/refresh", { body: { refresh_token: refreshToken } }),
    ]);
    const statuses = [left.status, right.status].sort();
    expect(statuses).toEqual([200, 401]);
  });
});

describe("resolveOAuthUser", () => {
  it("doğrulanmış id_token yeni kullanıcı açar ve oturum verir", async () => {
    const email = `${randomUUID()}@example.test`;
    const claims: OAuthClaims = {
      sub: randomUUID(),
      email,
      email_verified: true,
      given_name: "O",
      family_name: "Auth",
    };
    verifyOAuthIdToken.mockResolvedValue(claims);

    const response = await request(app, "/auth/oauth", {
      body: {
        provider: "google",
        id_token: "x".repeat(24),
      },
    });
    expect(response.status).toBe(200);
    expect(
      asEnvelope<{ access_token: string }>(response.body).data.access_token,
    ).toBeTruthy();

    const user = await db
      .selectFrom("user")
      .select(["status", "email"])
      .where("email", "=", email)
      .executeTakeFirst();
    expect(user?.status).toBe(UserStatus.active);
  });

  it("blocked kimlik USER_INACTIVE", async () => {
    const email = `${randomUUID()}@example.test`;
    const sub = randomUUID();
    const user = await userRepo.createAuthUser({
      first_name: "Ada",
      last_name: "Lovelace",
      email,
      password: await hash(password, 4),
      status: "blocked",
    });
    await identityRepo.insert({
      user_id: user.id,
      provider: "google",
      provider_subject: sub,
      provider_email: email,
    });
    verifyOAuthIdToken.mockResolvedValue({
      sub,
      email,
      email_verified: true,
    } satisfies OAuthClaims);

    const response = await request(app, "/auth/oauth", {
      body: { provider: "google", id_token: "x".repeat(24) },
    });
    expect(response.status).toBe(403);
    expect(asEnvelope<unknown>(response.body).code).toBe("USER_INACTIVE");
  });
});

describe("switchOrganization", () => {
  it("aktif üyelikte org oturuma yazılır", async () => {
    const email = `${randomUUID()}@example.test`;
    const user = await makeActiveUser(email);
    const organization = await makeOrganization({ owner_id: user.id });
    const person = await makePerson({
      organization_id: organization.id,
      user_id: user.id,
      status: "active",
    });
    await makeAccess({
      organization_id: organization.id,
      user_id: user.id,
      person_id: person.id,
    });

    const signIn = await request(app, "/auth/sign-in", {
      body: { email, password },
    });
    const token = asEnvelope<{ access_token: string }>(signIn.body).data
      .access_token;

    const switched = await request(app, `/auth/switch/${organization.id}`, {
      token,
    });
    expect(switched.status).toBe(200);
    expect(
      asEnvelope<{ organization_id: string }>(switched.body).data
        .organization_id,
    ).toBe(organization.id);
  });

  it("1. üyelik yoksa ACCESS_NOT_FOUND", async () => {
    const email = `${randomUUID()}@example.test`;
    await makeActiveUser(email);
    const signIn = await request(app, "/auth/sign-in", {
      body: { email, password },
    });
    const token = asEnvelope<{ access_token: string }>(signIn.body).data
      .access_token;

    const response = await request(app, `/auth/switch/${randomUUID()}`, {
      token,
    });
    expect(response.status).toBe(404);
    expect(asEnvelope<unknown>(response.body).code).toBe("ACCESS_NOT_FOUND");
  });

  it("2. pasif kişi ACCESS_INACTIVE", async () => {
    const email = `${randomUUID()}@example.test`;
    const user = await makeActiveUser(email);
    const organization = await makeOrganization({ owner_id: user.id });
    const person = await makePerson({
      organization_id: organization.id,
      user_id: user.id,
      status: "inactive",
    });
    await makeAccess({
      organization_id: organization.id,
      user_id: user.id,
      person_id: person.id,
    });
    const signIn = await request(app, "/auth/sign-in", {
      body: { email, password },
    });
    const token = asEnvelope<{ access_token: string }>(signIn.body).data
      .access_token;

    const response = await request(app, `/auth/switch/${organization.id}`, {
      token,
    });
    expect(response.status).toBe(403);
    expect(asEnvelope<unknown>(response.body).code).toBe("ACCESS_INACTIVE");
  });
});
