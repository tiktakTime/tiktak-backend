import { AppError } from "@/core/errors";
import * as repo from "@/modules/permission/permission.repo";

import type { PermissionUpdate } from "../permission.schema";

export async function updatePermission(
  orgId: string,
  id: string,
  input: PermissionUpdate,
) {
  const existing = await repo.findById(orgId, id);
  if (!existing) throw new AppError("PERMISSION_NOT_FOUND");
  if (existing.is_locked) throw new AppError("PERMISSION_LOCKED");
  const row = await repo.update(orgId, id, input);
  if (!row) throw new AppError("PERMISSION_NOT_FOUND");
  return row;
}
