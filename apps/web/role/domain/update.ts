import { AppError } from "@/core/errors";
import * as repo from "@/modules/role/role.repo";

import type { RoleUpdate } from "../role.schema";
import { assertRoleWritable } from "./guards";

export async function updateRole(id: string, input: RoleUpdate) {
  const existing = await repo.findById(id);
  if (!existing) throw new AppError("ROLE_NOT_FOUND");
  assertRoleWritable(existing);
  const row = await repo.update(id, input);
  if (!row) throw new AppError("ROLE_NOT_FOUND");
  return row;
}
