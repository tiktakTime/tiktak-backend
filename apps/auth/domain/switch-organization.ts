import { AppError } from "@/core/errors";
import * as accessRepo from "@/modules/access/access.repo";
import * as personRepo from "@/modules/person/person.repo";
import * as userRepo from "@/modules/user/user.repo";
import { updateSessionFields } from "@/platform/auth";

import { resolvePermissionSlugs } from "./resolve-permissions";

export async function switchOrganization(input: {
  userId: string;
  sessionId: string;
  organizationId: string;
}) {
  const { userId, sessionId, organizationId } = input;

  const access = await accessRepo.findByUserOrg(userId, organizationId);
  if (!access) throw new AppError("ACCESS_NOT_FOUND");
  if (access.status !== "active") {
    throw new AppError("ACCESS_INACTIVE");
  }

  const person = access.person_id
    ? await personRepo.findById(organizationId, access.person_id)
    : await personRepo.findActiveByUserId(organizationId, userId);

  if (person && person.status !== "active") {
    throw new AppError("ACCESS_INACTIVE");
  }

  const roleId = person?.role_id ?? access.role_id ?? null;
  const personId = person?.id ?? access.person_id ?? null;
  const permissions = await resolvePermissionSlugs({
    organizationId,
    roleId,
    personId,
  });

  await updateSessionFields(sessionId, {
    organization_id: organizationId,
    person_id: personId,
    role_id: roleId,
    permissions,
  });

  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("USER_NOT_FOUND");

  return {
    user_id: user.id,
    session_id: sessionId,
    organization_id: organizationId,
    person_id: personId,
    role_id: roleId,
    permissions,
    email: user.email ?? undefined,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}
