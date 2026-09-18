import * as repo from "@/modules/organization/organization.repo";

import type { OrganizationSearchQuery } from "../organization.schema";

export async function searchOrganizations(params: OrganizationSearchQuery) {
  return repo.search(params);
}
