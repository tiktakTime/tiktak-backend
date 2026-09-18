import { AppError } from "@/core/errors";
import * as repo from "@/modules/permission/permission.repo";

import type { PermissionCreate } from "../permission.schema";

export async function createPermission(orgId: string, input: PermissionCreate) {
  const global = await repo.findGlobalBySlug(input.slug);
  if (global) {
    throw new AppError("PERMISSION_SLUG_EXISTS_GLOBAL");
  }
  return repo.insert(orgId, input);
}
