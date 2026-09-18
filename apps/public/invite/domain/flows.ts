import { hash } from "bcryptjs";

import { AppError } from "@/core/errors";
import { normalizeEmail } from "@/core/fields";
import * as accessRepo from "@/modules/access/access.repo";
import { db } from "@/modules/db";
import { INVITE_STATUS } from "@/modules/invite/constants";
import * as repo from "@/modules/invite/invite.repo";
import type { InviteRow } from "@/modules/invite/invite.repo";
import * as organizationRepo from "@/modules/organization/organization.repo";
import * as personRepo from "@/modules/person/person.repo";
import * as userRepo from "@/modules/user/user.repo";

function isExpired(invite: InviteRow, now = new Date()): boolean {
  return new Date(invite.expires_at) <= now;
}

function resolveAcceptState(
  invite: InviteRow,
  blocking: unknown,
  now = new Date(),
) {
  if (invite.status === INVITE_STATUS.ACCEPTED) {
    return { can_accept: false, reason: "INVITE_ALREADY_ACCEPTED" as const };
  }
  if (invite.status === INVITE_STATUS.CANCELED) {
    return { can_accept: false, reason: "INVITE_CANCELED" as const };
  }
  if (invite.status === INVITE_STATUS.EXPIRED || isExpired(invite, now)) {
    return { can_accept: false, reason: "INVITE_EXPIRED" as const };
  }
  if (invite.status !== INVITE_STATUS.PENDING) {
    return { can_accept: false, reason: "INVITE_NOT_PENDING" as const };
  }
  if (blocking) {
    return { can_accept: false, reason: "ACCESS_ALREADY_EXISTS" as const };
  }
  return { can_accept: true, reason: null };
}

/** Public: token ile davet bilgisi. */
export async function getInviteByToken(tokenRaw: string) {
  const token = tokenRaw.trim();
  if (!token) throw new AppError("INVITE_TOKEN_REQUIRED");

  let invite = await repo.findByToken(token);
  if (!invite) throw new AppError("INVITE_NOT_FOUND");

  const now = new Date();
  if (invite.status === INVITE_STATUS.PENDING && isExpired(invite, now)) {
    invite =
      (await repo.updateById(invite.id, { status: INVITE_STATUS.EXPIRED })) ??
      invite;
  }

  const blocking = await accessRepo.findBlocking({
    organizationId: invite.organization_id,
    personId: invite.person_id,
    userId: invite.user_id,
  });

  const organization = await organizationRepo.findById(invite.organization_id);
  const person = await personRepo.findById(
    invite.organization_id,
    invite.person_id,
  );
  const { can_accept, reason } = resolveAcceptState(invite, blocking, now);

  return {
    invite: {
      status: invite.status,
      email: invite.email,
      description: invite.description,
      expires_at: invite.expires_at,
      accepted_at: invite.accepted_at,
    },
    organization: {
      id: organization?.id ?? invite.organization_id,
      company_name: organization?.company_name ?? "",
    },
    person: {
      first_name: person?.first_name ?? "",
      last_name: person?.last_name ?? "",
    },
    scenario: invite.user_id ? ("existing" as const) : ("new" as const),
    can_accept,
    reason,
  };
}

type Trx = typeof db;
type LockedInvite = Awaited<ReturnType<typeof lockInvite>>;
type InvitePerson = Awaited<ReturnType<typeof loadInvitePerson>>;

/** Daveti satır kilidiyle oku — eşzamanlı iki accept'i sıraya sokar. */
async function lockInvite(trx: Trx, token: string) {
  const invite = await trx
    .selectFrom("invite")
    .select(repo.COLUMNS)
    .where("token", "=", token)
    .where("deleted_at", "is", null)
    .forUpdate()
    .executeTakeFirst();

  if (!invite) throw new AppError("INVITE_NOT_FOUND");
  return invite;
}

/** Kabul edilebilirlik; süresi geçmişse durumu kalıcı olarak `expired` yazar. */
async function assertAcceptable(
  trx: Trx,
  invite: LockedInvite,
  now: Date,
): Promise<void> {
  if (invite.status === INVITE_STATUS.ACCEPTED) {
    throw new AppError("INVITE_ALREADY_ACCEPTED");
  }
  if (invite.status === INVITE_STATUS.CANCELED) {
    throw new AppError("INVITE_CANCELED");
  }
  if (
    invite.status === INVITE_STATUS.EXPIRED ||
    isExpired(invite as InviteRow, now)
  ) {
    await trx
      .updateTable("invite")
      .set({ status: INVITE_STATUS.EXPIRED, updated_at: now })
      .where("id", "=", invite.id)
      .execute();
    throw new AppError("INVITE_EXPIRED");
  }
  if (invite.status !== INVITE_STATUS.PENDING) {
    throw new AppError("INVITE_NOT_PENDING");
  }
}

async function loadInvitePerson(trx: Trx, personId: string) {
  const person = await trx
    .selectFrom("person")
    .select([
      "id",
      "organization_id",
      "user_id",
      "role_id",
      "first_name",
      "last_name",
      "picture",
      "email",
    ])
    .where("id", "=", personId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  if (!person) throw new AppError("INVITE_PERSON_NOT_FOUND");
  return person;
}

/** Yeni kullanıcı (S2): e-posta eşleşirse onu bağla, yoksa hesap aç. */
async function resolveNewUserId(
  invite: LockedInvite,
  person: InvitePerson,
  password: string | null | undefined,
): Promise<string> {
  if (person.user_id) throw new AppError("PERSON_USER_ALREADY_LINKED");

  const email = normalizeEmail(invite.email);
  const existingByEmail = email ? await userRepo.findIdByEmail(email) : null;
  if (existingByEmail) return existingByEmail;

  if (!password || String(password).length < 8) {
    throw new AppError("INVITE_PASSWORD_REQUIRED");
  }

  const created = await userRepo.createAuthUser({
    first_name: person.first_name,
    last_name: person.last_name,
    email: email!,
    password: await hash(password, 10),
    status: "active",
    email_verified_at: new Date(),
    picture: person.picture,
  });

  return created.id;
}

/** Davetin sahibi kullanıcı (S1) veya yeni hesap (S2). */
async function resolveUserId(
  invite: LockedInvite,
  person: InvitePerson,
  password: string | null | undefined,
): Promise<string> {
  if (!invite.user_id) return resolveNewUserId(invite, person, password);

  const existingUser = await userRepo.findById(invite.user_id);
  if (!existingUser) throw new AppError("INVITE_USER_NOT_FOUND");
  return invite.user_id;
}

/** Public: daveti kabul et (S1/S2). */
export async function acceptInvite(input: {
  token: string;
  password?: string | null;
}) {
  const token = input.token.trim();
  if (!token) throw new AppError("INVITE_TOKEN_REQUIRED");

  return db.transaction().execute(async (trx) => {
    const now = new Date();
    const invite = await lockInvite(trx, token);
    await assertAcceptable(trx, invite, now);

    const person = await loadInvitePerson(trx, invite.person_id);

    const blocking = await accessRepo.findBlocking({
      organizationId: invite.organization_id,
      personId: invite.person_id,
      userId: invite.user_id,
    });
    if (blocking) throw new AppError("ACCESS_ALREADY_EXISTS");

    const userId = await resolveUserId(invite, person, input.password);

    const access = await trx
      .insertInto("access")
      .values({
        organization_id: invite.organization_id,
        person_id: invite.person_id,
        user_id: userId,
        role_id: person.role_id,
        status: "active",
        description: "Invite accepted",
      })
      .returning(accessRepo.COLUMNS)
      .executeTakeFirstOrThrow();

    const userForImage = await userRepo.findById(userId);
    await trx
      .updateTable("person")
      .set({
        user_id: userId,
        status: "active",
        updated_by_id: userId,
        updated_at: now,
        ...(!person.picture && userForImage?.picture
          ? { picture: userForImage.picture }
          : {}),
      })
      .where("id", "=", person.id)
      .execute();

    const updatedInvite = await trx
      .updateTable("invite")
      .set({
        status: INVITE_STATUS.ACCEPTED,
        accepted_at: now,
        user_id: userId,
        updated_at: now,
      })
      .where("id", "=", invite.id)
      .returning(repo.COLUMNS)
      .executeTakeFirstOrThrow();

    return {
      access,
      invite: updatedInvite,
      organization_id: invite.organization_id,
      user_id: userId,
    };
  });
}
