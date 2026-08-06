import { v4 as uuidv4 } from "uuid";

import type { Database } from "../../types";
import { type CreateRole, type UpdateRole } from "./roles.types";

export class RoleRepository {
  constructor(private readonly db: Database) {}

  async findAllByOrganizationId(organizationId: string) {
    return this.db
      .selectFrom("MembershipRole")
      .selectAll()
      .where("organizationId", "=", organizationId)
      .execute();
  }

  async findById(organizationId: string, id: string) {
    return this.db
      .selectFrom("MembershipRole")
      .selectAll()
      .where("organizationId", "=", organizationId)
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async create(organizationId: string, data: CreateRole) {
    return this.db
      .insertInto("MembershipRole")
      .values({
        id: uuidv4(),
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async update(organizationId: string, id: string, data: UpdateRole) {
    return this.db
      .updateTable("MembershipRole")
      .set({ ...data, updatedAt: new Date() })
      .where("organizationId", "=", organizationId)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(organizationId: string, id: string) {
    return this.db
      .deleteFrom("MembershipRole")
      .where("organizationId", "=", organizationId)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}

export default RoleRepository;
