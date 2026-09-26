import { AppError } from "@/core/errors";
import * as repo from "@/modules/permission/permission.repo";

export async function getPermission(orgId: string, id: string) {
  const row = await repo.findById(orgId, id);
  if (!row) throw new AppError("PERMISSION_NOT_FOUND");
  return row;
}
