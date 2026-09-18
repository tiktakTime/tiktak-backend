import { AppError } from "@/core/errors";
import { normalizeEmail } from "@/core/fields";
import * as accessRepo from "@/modules/access/access.repo";
import { INVITE_STATUS } from "@/modules/invite/constants";
import * as repo from "@/modules/invite/invite.repo";
import type { InviteRow } from "@/modules/invite/invite.repo";
import * as organizationRepo from "@/modules/organization/organization.repo";
import * as personRepo from "@/modules/person/person.repo";
import * as userRepo from "@/modules/user/user.repo";
import { buildVerificationLink, sendEmail } from "@/platform/notifications";

async function sendInviteMail(invite: InviteRow) {
  const person = await personRepo.findById(
    invite.organization_id,
    invite.person_id,
  );
  const organization = await organizationRepo.findById(invite.organization_id);
  if (!person) return;

  await sendEmail({
    key: "v2:invite",
    userId: invite.user_id,
    mail: invite.email,
    payload: {
      firstName: person.first_name,
      lastName: person.last_name,
      organizationName: organization?.company_name || "",
      redirectUrl: buildVerificationLink("/invite/accept", invite.token),
      description: invite.description || "",
      expiresAt: invite.expires_at,
    },
  });
}

async function resolveInviteTarget(person: {
  id: string;
  user_id: string | null;
  email: string | null;
}) {
  if (person.user_id) {
    const linkedUser = await userRepo.findById(person.user_id);
    if (!linkedUser) throw new AppError("INVITE_LINKED_USER_NOT_FOUND");

    const personEmail = normalizeEmail(person.email);
    const userEmail = normalizeEmail(linkedUser.email);
    if (!personEmail || personEmail !== userEmail) {
      throw new AppError("PERSON_EMAIL_USER_MISMATCH");
    }

    return { inviteEmail: userEmail, inviteUserId: linkedUser.id };
  }

  const personEmail = normalizeEmail(person.email);
  if (!personEmail) throw new AppError("INVITE_PERSON_EMAIL_MISSING");

  const matchedId = await userRepo.findIdByEmail(personEmail);
  return { inviteEmail: personEmail, inviteUserId: matchedId ?? null };
}

/** Admin: davet oluştur + mail. */
export async function createInvite(input: {
  organizationId: string;
  actorUserId: string;
  personId: string;
  description?: string | null;
  expiresAt?: string | Date | null;
}) {
  const person = await personRepo.findById(
    input.organizationId,
    input.personId,
  );
  if (!person) throw new AppError("INVITE_PERSON_NOT_FOUND");

  const { inviteEmail, inviteUserId } = await resolveInviteTarget(person);

  const blocking = await accessRepo.findBlocking({
    organizationId: input.organizationId,
    personId: person.id,
    userId: inviteUserId,
  });
  if (blocking) throw new AppError("INVITE_ACCESS_EXISTS");

  const pending = await repo.findPendingByPerson(
    input.organizationId,
    person.id,
  );
  if (pending) {
    throw new AppError("INVITE_PENDING_EXISTS");
  }

  const token = await repo.generateUniqueToken();
  const expiresAt = input.expiresAt
    ? new Date(input.expiresAt)
    : repo.computeExpiry();

  const created = await repo.insert({
    organization_id: input.organizationId,
    person_id: person.id,
    user_id: inviteUserId,
    email: inviteEmail,
    token,
    description: input.description ?? null,
    expires_at: expiresAt,
    created_by_id: input.actorUserId,
  });

  try {
    await sendInviteMail(created);
  } catch (err) {
    console.error("Invite email send failed:", err);
  }

  return created;
}

export async function resendInvite(input: {
  organizationId: string;
  actorUserId: string;
  inviteId: string;
}) {
  const invite = await repo.findById(input.organizationId, input.inviteId);
  if (!invite) throw new AppError("INVITE_NOT_FOUND");
  if (invite.status !== INVITE_STATUS.PENDING) {
    throw new AppError("INVITE_NOT_PENDING");
  }

  const token = await repo.generateUniqueToken();
  const updated = await repo.updateById(invite.id, {
    token,
    expires_at: repo.computeExpiry(),
    accept_attempts: 0,
    last_attempt_at: null,
    locked_until: null,
    updated_by_id: input.actorUserId,
  });

  if (!updated) throw new AppError("INVITE_NOT_FOUND");

  try {
    await sendInviteMail(updated);
  } catch (err) {
    console.error("Invite resend email failed:", err);
  }

  return updated;
}

export async function cancelInvite(input: {
  organizationId: string;
  actorUserId: string;
  inviteId: string;
}) {
  const invite = await repo.findById(input.organizationId, input.inviteId);
  if (!invite) throw new AppError("INVITE_NOT_FOUND");
  if (invite.status !== INVITE_STATUS.PENDING) {
    throw new AppError("INVITE_NOT_PENDING");
  }

  const updated = await repo.updateById(invite.id, {
    status: INVITE_STATUS.CANCELED,
    canceled_at: new Date(),
    updated_by_id: input.actorUserId,
  });

  if (!updated) throw new AppError("INVITE_NOT_FOUND");
  return updated;
}

export async function getInvite(organizationId: string, inviteId: string) {
  const invite = await repo.findById(organizationId, inviteId);
  if (!invite) throw new AppError("INVITE_NOT_FOUND");
  return invite;
}

export async function searchInvites(
  organizationId: string,
  params: { page: number; limit: number; status?: string },
) {
  return repo.search(organizationId, params);
}
