import { AppError } from "@/core/errors";
import * as repo from "@/modules/organization/organization.repo";

export async function getOrganization(id: string) {
  const row = await repo.findById(id);
  if (!row) throw new AppError("ORGANIZATION_NOT_FOUND");
  return row;
}
