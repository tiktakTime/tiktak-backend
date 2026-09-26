import { AppError } from "@/core/errors";
import * as repo from "@/modules/role/role.repo";

export async function getRole(orgId: string, id: string) {
  const row = await repo.findById(orgId, id);
  if (!row) throw new AppError("ROLE_NOT_FOUND");
  return row;
}
