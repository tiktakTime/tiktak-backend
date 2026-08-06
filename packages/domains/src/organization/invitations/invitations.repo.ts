import { jsonObjectFrom } from "kysely/helpers/postgres";
import { v4 as uuidv4 } from "uuid";

import { InvitationStatus } from "@tiktak/database";

import type { Database } from "../../types";
import { type CreateInvitation } from "./invitations.types";

export class InvitationRepository {
  constructor(private readonly db: Database) {}

  async findAllByOrganizationId(organizationId: string) {
    return this.db
      .selectFrom("OrganizationInvitation")
      .selectAll()
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom("User")
            .select(["id", "name", "email", "avatar"])
            .whereRef("User.id", "=", "OrganizationInvitation.invitedByUserId"),
        ).as("invitedBy"),
        jsonObjectFrom(
          eb
            .selectFrom("MembershipRole")
            .select(["id", "name"])
            .whereRef(
              "MembershipRole.id",
              "=",
              "OrganizationInvitation.roleId",
            ),
        ).as("role"),
      ])
      .where("organizationId", "=", organizationId)
      .execute();
  }

  async findById(organizationId: string, id: string) {
    return this.db
      .selectFrom("OrganizationInvitation")
      .selectAll()
      .where("organizationId", "=", organizationId)
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async create(
    organizationId: string,
    invitedByUserId: string,
    data: CreateInvitation,
  ) {
    return this.db
      .insertInto("OrganizationInvitation")
      .values({
        id: uuidv4(),
        organizationId,
        invitedByUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
        status: InvitationStatus.PENDING,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async delete(organizationId: string, id: string) {
    return this.db
      .deleteFrom("OrganizationInvitation")
      .where("organizationId", "=", organizationId)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async updateStatus(
    organizationId: string,
    id: string,
    status: InvitationStatus,
  ) {
    return this.db
      .updateTable("OrganizationInvitation")
      .set({ status, updatedAt: new Date() })
      .where("organizationId", "=", organizationId)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}

export default InvitationRepository;
