import { AppError } from "@/core/errors";
import * as repo from "@/modules/permission/permission.repo";

export async function getPermission(id: string) {
  const row = await repo.findById(id);
  if (!row) throw new AppError("PERMISSION_NOT_FOUND");
  return row;
}
