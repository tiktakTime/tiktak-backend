import { jsonObjectFrom } from "kysely/helpers/postgres";
import { v4 as uuidv4 } from "uuid";

import { AppError, paginate, unaccentIlike } from "@tiktak/core";

import type { Database } from "../../types";
import {
  type CreateOrganization,
  type ListPendingInvitationsParams,
  type OrganizationListParams,
  type UpdateOrganization,
} from "./core.types";

export class OrganizationRepository {
  constructor(private readonly db: Database) {}

  async findBySlug(slug: string, userId: string) {
    let query = this.db
      .selectFrom("Organization")
      .selectAll("Organization")
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom("User")
            .select(["id", "name", "email", "avatar"])
            .whereRef("User.id", "=", "Organization.ownerUserId"),
        ).as("owner"),
      ])
      .where("Organization.slug", "=", slug);

    query = query.where((eb) =>
      eb.or([
        eb.exists(
          eb
            .selectFrom("OrganizationMembership")
            .whereRef("organizationId", "=", "Organization.id")
            .where("userId", "=", userId),
        ),
        eb.exists(
          eb
            .selectFrom("User")
            .where("id", "=", userId)
            .where("isSuperAdmin", "=", true),
        ),
      ]),
    );

    return query.executeTakeFirst();
  }

  async findById(id: string) {
    return this.db
      .selectFrom("Organization")
      .selectAll("Organization")
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom("User")
            .select(["id", "name", "email", "avatar"])
            .whereRef("User.id", "=", "Organization.ownerUserId"),
        ).as("owner"),
      ])
      .where("Organization.id", "=", id)
      .executeTakeFirst();
  }

  async create(organization: CreateOrganization) {
    const orgId = uuidv4();

    return this.db.transaction().execute(async (tx) => {
      const existing = await tx
        .selectFrom("Organization")
        .select("id")
        .where("slug", "=", organization.slug)
        .executeTakeFirst();

      if (existing) {
        throw new AppError("SLUG_ALREADY_EXISTS");
      }

      await tx
        .insertInto("Organization")
        .values({
          id: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...organization,
          avatar: null,
        })
        .execute();

      const roleId = uuidv4();
      await tx
        .insertInto("MembershipRole")
        .values({
          id: roleId,
          name: "Admin",
          permissions: [],
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      await tx
        .insertInto("OrganizationMembership")
        .values({
          id: uuidv4(),
          organizationId: orgId,
          userId: organization.ownerUserId,
          roleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      return tx
        .selectFrom("Organization")
        .selectAll()
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("User")
              .select(["id", "name", "email", "avatar"])
              .whereRef("User.id", "=", "Organization.ownerUserId"),
          ).as("owner"),
        ])
        .where("id", "=", orgId)
        .executeTakeFirst();
    });
  }

  async update(id: string, organization: UpdateOrganization) {
    if (organization.slug) {
      const existing = await this.db
        .selectFrom("Organization")
        .select("id")
        .where("slug", "=", organization.slug)
        .where("id", "!=", id)
        .executeTakeFirst();

      if (existing) {
        throw new AppError("SLUG_ALREADY_EXISTS");
      }
    }

    await this.db
      .updateTable("Organization")
      .set({
        ...organization,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .execute();

    return this.findById(id);
  }

  async delete(id: string) {
    const result = await this.db
      .deleteFrom("Organization")
      .where("id", "=", id)
      .executeTakeFirst();

    return result.numDeletedRows > 0n;
  }

  async listUserOrganizations(
    userId: string,
    params: OrganizationListParams,
  ) {
    let query = this.db
      .selectFrom("Organization")
      .innerJoin(
        "OrganizationMembership",
        "OrganizationMembership.organizationId",
        "Organization.id",
      )
      .select([
        "Organization.id",
        "Organization.name",
        "Organization.slug",
        "Organization.avatar",
        "Organization.createdAt",
        "OrganizationMembership.roleId",
      ])
      .where("OrganizationMembership.userId", "=", userId);

    if (params.q) {
      const searchVal = params.q;
      query = query.where((eb) =>
        unaccentIlike(eb, ["Organization.name", "Organization.slug"], searchVal),
      );
    }

    return paginate(query, params, ["Organization.createdAt"]);
  }

  async transferOwnership(id: string, newOwnerUserId: string) {
    return this.db.transaction().execute(async (tx) => {
      const isMember = await tx
        .selectFrom("OrganizationMembership")
        .select("id")
        .where("organizationId", "=", id)
        .where("userId", "=", newOwnerUserId)
        .executeTakeFirst();

      if (!isMember) {
        throw new AppError("USER_NOT_MEMBER");
      }

      await tx
        .updateTable("Organization")
        .set({ ownerUserId: newOwnerUserId, updatedAt: new Date() })
        .where("id", "=", id)
        .execute();

      return tx
        .selectFrom("Organization")
        .selectAll()
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("User")
              .select(["id", "name", "email", "avatar"])
              .whereRef("User.id", "=", "Organization.ownerUserId"),
          ).as("owner"),
        ])
        .where("id", "=", id)
        .executeTakeFirst();
    });
  }

  async listPendingInvitationsByEmail(
    email: string,
    params: ListPendingInvitationsParams,
  ) {
    let query = this.db
      .selectFrom("OrganizationInvitation")
      .select((eb) => [
        "OrganizationInvitation.id",
        "OrganizationInvitation.roleId",
        "OrganizationInvitation.createdAt",
        jsonObjectFrom(
          eb
            .selectFrom("Organization")
            .select(["name", "slug"])
            .whereRef("id", "=", "OrganizationInvitation.organizationId"),
        ).as("organization"),
        jsonObjectFrom(
          eb
            .selectFrom("MembershipRole")
            .select(["name"])
            .whereRef("id", "=", "OrganizationInvitation.roleId"),
        ).as("role"),
      ])
      .where("OrganizationInvitation.email", "=", email.toLowerCase());

    if (params.q) {
      const searchVal = params.q;
      query = query.where((eb) =>
        eb.exists(
          eb
            .selectFrom("Organization")
            .select("id")
            .whereRef("id", "=", "OrganizationInvitation.organizationId")
            .where((innerEb) =>
              unaccentIlike(innerEb, ["name", "slug"], searchVal),
            ),
        ),
      );
    }

    return paginate(query, params, ["OrganizationInvitation.createdAt"]);
  }
}

export default OrganizationRepository;
