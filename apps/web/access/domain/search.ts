import * as repo from "@/modules/access/access.repo";

import type { AccessSearchQuery } from "../access.schema";

export async function searchAccess(userId: string, params: AccessSearchQuery) {
  return repo.search(userId, params);
}
