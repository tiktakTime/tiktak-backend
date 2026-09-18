import { AppError } from "@/core/errors";
import { db } from "@/modules/db";
import * as orgRepo from "@/modules/organization/organization.repo";
import { OWNER_ROLE_ID } from "@/modules/organization/organization.repo";
import * as userRepo from "@/modules/user/user.repo";

import type { OrganizationCreate } from "../organization.schema";

/** Create org + owner person + access in one transaction. */
export async function createOrganizationWithOwner(
  input: OrganizationCreate,
  ownerUserId: string,
) {
  const existingName = await orgRepo.findActiveByCompanyName(
    input.company_name,
  );
  if (existingName) {
    throw new AppError("ORGANIZATION_NAME_EXISTS");
  }

  const owner = await userRepo.findNameEmailById(ownerUserId);
  if (!owner) throw new AppError("USER_NOT_FOUND");

  return db.transaction().execute(async (trx) => {
    const org = await orgRepo.insert(
      {
        company_name: input.company_name,
        first_name: input.first_name ?? owner.first_name,
        last_name: input.last_name ?? owner.last_name,
        business_type: input.business_type,
        owner_id: ownerUserId,
        status: "active",
      },
      trx,
    );

    const person = await trx
      .insertInto("person")
      .values({
        organization_id: org.id,
        user_id: ownerUserId,
        role_id: OWNER_ROLE_ID,
        first_name: owner.first_name,
        last_name: owner.last_name,
        email: owner.email,
        status: "active",
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();

    await trx
      .insertInto("access")
      .values({
        organization_id: org.id,
        user_id: ownerUserId,
        person_id: person.id,
        role_id: OWNER_ROLE_ID,
        status: "active",
      })
      .execute();

    return org;
  });
}
