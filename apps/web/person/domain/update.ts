import { AppError } from "@/core/errors";
import * as repo from "@/modules/person/person.repo";
import { revokeOrganizationSessions } from "@/platform/auth";

import type { PersonUpdate } from "../person.schema";

const ACCESS_SYNC_STATUSES = new Set(["active", "inactive", "blocked"]);

export async function updatePerson(
  orgId: string,
  id: string,
  input: PersonUpdate,
) {
  const existing = await repo.findById(orgId, id);
  if (!existing) throw new AppError("PERSON_NOT_FOUND");

  const { role_id: _roleId, ...rest } = input as PersonUpdate & {
    role_id?: unknown;
  };

  if (
    existing.user_id &&
    rest.email !== undefined &&
    rest.email !== existing.email
  ) {
    throw new AppError("PERSON_EMAIL_LOCKED");
  }

  const row = await repo.update(orgId, id, rest);
  if (!row) throw new AppError("PERSON_NOT_FOUND");

  if (rest.status && ACCESS_SYNC_STATUSES.has(rest.status)) {
    await repo.syncAccessStatus(
      orgId,
      id,
      rest.status as "active" | "inactive" | "blocked",
    );

    if (rest.status !== "active" && row.user_id) {
      await revokeOrganizationSessions(row.user_id, orgId);
    }
  }

  return row;
}
