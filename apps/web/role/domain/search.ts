import * as repo from "@/modules/role/role.repo";

import type { RoleSearchQuery } from "../role.schema";

export async function searchRoles(orgId: string, params: RoleSearchQuery) {
  return repo.search(orgId, params);
}
