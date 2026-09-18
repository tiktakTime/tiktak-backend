import { AppError } from "@/core/errors";
import * as repo from "@/modules/permission/permission.repo";

import { assertPermissionWritable } from "./guards";

export async function softDeletePermission(orgId: string, id: string) {
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("PERMISSION_NOT_FOUND");
  assertPermissionWritable(existing, orgId);
  const row = await repo.softDelete(id);
  if (!row) throw new AppError("PERMISSION_NOT_FOUND");
  return row;
}
