import { randomUUID } from "node:crypto";

import { OrganizationBusinessType } from "@/modules/db";
import * as organizationRepo from "@/modules/organization/organization.repo";

import { makeUser } from "./user";

type OrganizationInput = Parameters<typeof organizationRepo.insert>[0];

/** Sahibi verilmezse yeni bir kullanıcı açar. */
export async function makeOrganization(
  overrides: Partial<OrganizationInput> = {},
) {
  const ownerId = overrides.owner_id ?? (await makeUser()).id;
  return organizationRepo.insert({
    company_name: `Org ${randomUUID()}`,
    first_name: "Ada",
    last_name: "Lovelace",
    business_type: OrganizationBusinessType.sole_proprietorship,
    status: "active",
    ...overrides,
    owner_id: ownerId,
  });
}
