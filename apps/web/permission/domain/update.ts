import { AppError } from "@/core/errors";
import * as repo from "@/modules/permission/permission.repo";

import type { PermissionUpdate } from "../permission.schema";
import { assertPermissionWritable } from "./guards";

export async function updatePermission(id: string, input: PermissionUpdate) {
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("PERMISSION_NOT_FOUND");
  assertPermissionWritable(existing);
  const row = await repo.update(id, input);
  if (!row) throw new AppError("PERMISSION_NOT_FOUND");
  return row;
}
