import { AppError } from "@/core/errors";
import * as repo from "@/modules/organization/organization.repo";

export async function restoreOrganization(id: string) {
  const existing = await repo.findByIdAny(id);
  if (!existing) {
    throw new AppError("DELETED_RECORD_NOT_FOUND");
  }
  if (!existing.deleted_at) {
    throw new AppError("ALREADY_ACTIVE");
  }

  const row = await repo.clearDeletedAt(id);
  if (!row) throw new AppError("DELETED_RECORD_NOT_FOUND");
  return row;
}
