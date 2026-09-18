import * as repo from "@/modules/role/role.repo";

import type { RoleCreate } from "../role.schema";

export async function createRole(orgId: string, input: RoleCreate) {
  return repo.insert(orgId, input);
}
