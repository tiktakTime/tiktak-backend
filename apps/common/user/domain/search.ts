import * as repo from "@/modules/user/user.repo";

import type { UserSearchQuery } from "../user.schema";

export async function searchUsers(params: UserSearchQuery) {
  return repo.search(params);
}
