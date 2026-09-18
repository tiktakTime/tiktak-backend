import { AppError } from "@/core/errors";
import * as repo from "@/modules/person/person.repo";

export async function restorePerson(orgId: string, id: string) {
  const existing = await repo.findByIdAny(orgId, id);
  if (!existing) {
    throw new AppError("DELETED_RECORD_NOT_FOUND");
  }
  if (!existing.deleted_at) {
    throw new AppError("ALREADY_ACTIVE");
  }

  const row = await repo.clearDeletedAt(orgId, id);
  if (!row) throw new AppError("DELETED_RECORD_NOT_FOUND");
  return row;
}
