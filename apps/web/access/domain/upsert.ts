import { AppError } from "@/core/errors";
import * as repo from "@/modules/access/access.repo";
import * as personRepo from "@/modules/person/person.repo";
import { revokeOrganizationSessions } from "@/platform/auth";

import type { AccessCreate } from "../access.schema";

export async function upsertAccess(input: AccessCreate) {
  const person = await personRepo.findActiveByUserId(
    input.organization_id,
    input.user_id,
  );

  const existing = await repo.findByUserOrg(
    input.user_id,
    input.organization_id,
  );

  const expiredDate = input.expired_date
    ? new Date(input.expired_date)
    : (person?.expired_date ?? null);

  let row;
  if (existing) {
    row = await repo.updateUpsertFields(existing.id, {
      person_id: person?.id ?? input.person_id ?? null,
      role_id: person?.role_id ?? null,
      status: input.status ?? "active",
      description: input.description ?? null,
      expired_date: expiredDate,
    });
  } else {
    row = await repo.insert({
      organization_id: input.organization_id,
      user_id: input.user_id,
      person_id: person?.id ?? input.person_id ?? null,
      role_id: person?.role_id ?? null,
      status: input.status ?? "active",
      description: input.description ?? null,
      expired_date: expiredDate,
    });
  }

  if (
    person &&
    input.status &&
    ["active", "inactive", "blocked"].includes(input.status)
  ) {
    await repo.syncPersonFromAccess(
      person.id,
      input.status as "active" | "inactive" | "blocked",
      input.expired_date !== undefined
        ? input.expired_date
          ? new Date(input.expired_date)
          : null
        : undefined,
    );
  }

  const status = row?.status ?? input.status ?? "active";
  if (status !== "active") {
    await revokeOrganizationSessions(input.user_id, input.organization_id);
  }

  if (!row) throw new AppError("ACCESS_NOT_FOUND");
  return row;
}
