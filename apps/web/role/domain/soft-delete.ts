import { AppError } from "@/core/errors";
import * as repo from "@/modules/role/role.repo";

export async function softDeleteRole(orgId: string, id: string) {
  const existing = await repo.findById(orgId, id);
  if (!existing) throw new AppError("ROLE_NOT_FOUND");
  if (existing.is_locked) throw new AppError("ROLE_LOCKED");
  const row = await repo.softDelete(orgId, id);
  if (!row) throw new AppError("ROLE_NOT_FOUND");
  return row;
}
