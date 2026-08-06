import { jsonObjectFrom } from "kysely/helpers/postgres";

import type { Database } from "../../types";
import { type UpdateMembership } from "./members.types";

export class MembershipRepository {
  constructor(private readonly db: Database) {}

  async findAllByOrganizationId(organizationId: string) {
    return this.db
      .selectFrom("OrganizationMembership")
      .selectAll()
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom("User")
            .select(["id", "name", "email", "avatar"])
            .whereRef("User.id", "=", "OrganizationMembership.userId"),
        ).as("user"),
        jsonObjectFrom(
          eb
            .selectFrom("MembershipRole")
            .select(["id", "name"])
            .whereRef(
              "MembershipRole.id",
              "=",
              "OrganizationMembership.roleId",
            ),
        ).as("role"),
      ])
      .where("organizationId", "=", organizationId)
      .execute();
  }

  async isMember(organizationId: string, userId: string): Promise<boolean> {
    const membership = await this.db
      .selectFrom("OrganizationMembership")
      .select("id")
      .where("organizationId", "=", organizationId)
      .where("userId", "=", userId)
      .executeTakeFirst();
    return !!membership;
  }

  async findById(organizationId: string, id: string) {
    return this.db
      .selectFrom("OrganizationMembership")
      .selectAll()
      .where("organizationId", "=", organizationId)
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async update(organizationId: string, id: string, data: UpdateMembership) {
    return this.db
      .updateTable("OrganizationMembership")
      .set({ ...data, updatedAt: new Date() })
      .where("organizationId", "=", organizationId)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(organizationId: string, id: string) {
    return this.db
      .deleteFrom("OrganizationMembership")
      .where("organizationId", "=", organizationId)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}

export default MembershipRepository;
