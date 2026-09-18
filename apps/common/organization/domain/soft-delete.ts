import { AppError } from "@/core/errors";
import * as repo from "@/modules/organization/organization.repo";

export async function softDeleteOrganization(id: string) {
  const row = await repo.softDelete(id);
  if (!row) throw new AppError("ORGANIZATION_NOT_FOUND");
  return row;
}
