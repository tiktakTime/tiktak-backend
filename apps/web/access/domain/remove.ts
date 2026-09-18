import { AppError } from "@/core/errors";
import * as repo from "@/modules/access/access.repo";
import { revokeOrganizationSessions } from "@/platform/auth";

export async function removeAccess(id: string) {
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("ACCESS_NOT_FOUND");

  const row = await repo.deleteById(id);

  if (existing.user_id && existing.organization_id) {
    await revokeOrganizationSessions(
      existing.user_id,
      existing.organization_id,
    );
  }

  if (!row) throw new AppError("ACCESS_NOT_FOUND");
  return row;
}
