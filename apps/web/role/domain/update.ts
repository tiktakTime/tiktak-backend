import { AppError } from "@/core/errors";
import * as repo from "@/modules/role/role.repo";

import type { RoleUpdate } from "../role.schema";

export async function updateRole(orgId: string, id: string, input: RoleUpdate) {
  const existing = await repo.findById(orgId, id);
  if (!existing) throw new AppError("ROLE_NOT_FOUND");
  if (existing.is_locked) throw new AppError("ROLE_LOCKED");
  const row = await repo.update(orgId, id, input);
  if (!row) throw new AppError("ROLE_NOT_FOUND");
  return row;
}
