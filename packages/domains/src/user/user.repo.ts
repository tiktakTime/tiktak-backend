import { v4 as uuidv4 } from "uuid";

import type { Database } from "../types";
import { type CreateUser, type UpdateUser } from "./user.types";

export class UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string) {
    return this.db
      .selectFrom("User")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByEmail(email: string) {
    return this.db
      .selectFrom("User")
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst();
  }

  async create(user: CreateUser) {
    return this.db
      .insertInto("User")
      .values({
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        avatar: user.avatar ?? null,
        isVerified: user.isVerified ?? false,
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirst();
  }

  async update(id: string, data: UpdateUser) {
    return this.db
      .updateTable("User")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async joinOrganization(userId: string, invitationId: string) {
    return this.db.transaction().execute(async (tx) => {
      const invitation = await tx
        .selectFrom("OrganizationInvitation")
        .selectAll()
        .where("id", "=", invitationId)
        .executeTakeFirst();

      if (!invitation || invitation.status !== "PENDING") {
        return { success: false, error: "INVALID_INVITATION" };
      }

      await tx
        .insertInto("OrganizationMembership")
        .values({
          id: uuidv4(),
          userId,
          organizationId: invitation.organizationId,
          roleId: invitation.roleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      await tx
        .updateTable("OrganizationInvitation")
        .set({ status: "ACCEPTED", updatedAt: new Date() })
        .where("id", "=", invitationId)
        .execute();

      return { success: true, organizationId: invitation.organizationId };
    });
  }
}

export default UserRepository;
