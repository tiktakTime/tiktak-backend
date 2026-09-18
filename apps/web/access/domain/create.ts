import * as repo from "@/modules/access/access.repo";

import type { AccessCreate } from "../access.schema";

export async function createAccess(input: AccessCreate) {
  return repo.insert({
    organization_id: input.organization_id,
    user_id: input.user_id,
    person_id: input.person_id ?? null,
    status: input.status ?? "active",
    description: input.description ?? null,
    expired_date: input.expired_date ? new Date(input.expired_date) : null,
  });
}
