import { AppError } from "@/core/errors";
import * as repo from "@/modules/role/role.repo";

import { assertRoleWritable } from "./guards";

export async function softDeleteRole(orgId: string, id: string) {
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("ROLE_NOT_FOUND");
  assertRoleWritable(existing, orgId);
  const row = await repo.softDelete(id);
  if (!row) throw new AppError("ROLE_NOT_FOUND");
  return row;
}
