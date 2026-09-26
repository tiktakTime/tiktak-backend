import { AppError } from "@/core/errors";
import * as repo from "@/modules/permission/permission.repo";

export async function softDeletePermission(orgId: string, id: string) {
  const existing = await repo.findById(orgId, id);
  if (!existing) throw new AppError("PERMISSION_NOT_FOUND");
  if (existing.is_locked) throw new AppError("PERMISSION_LOCKED");
  const row = await repo.softDelete(orgId, id);
  if (!row) throw new AppError("PERMISSION_NOT_FOUND");
  return row;
}
