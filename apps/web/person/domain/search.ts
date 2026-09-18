import * as repo from "@/modules/person/person.repo";

import type { PersonSearchQuery } from "../person.schema";

export async function searchPersons(orgId: string, params: PersonSearchQuery) {
  return repo.search(orgId, params);
}
