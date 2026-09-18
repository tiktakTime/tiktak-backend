import * as repo from "@/modules/permission/permission.repo";

import type { PermissionSearchQuery } from "../permission.schema";

export async function searchPermissions(
  orgId: string,
  params: PermissionSearchQuery,
) {
  return repo.search(orgId, params);
}
