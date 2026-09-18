import { db } from "@/core/database";
import { AppError } from "@/core/errors";
import * as repo from "@/modules/person/person.repo";
import { revokeOrganizationSessions } from "@/platform/auth";

export async function softDeletePerson(
  orgId: string,
  id: string,
  sessionUserId: string,
) {
  const existing = await repo.findById(orgId, id);
  if (!existing) throw new AppError("PERSON_NOT_FOUND");

  if (existing.user_id && existing.user_id === sessionUserId) {
    throw new AppError("PERSON_CANNOT_DELETE_SELF");
  }

  const row = await db.transaction().execute(async (trx) => {
    const deleted = await repo.markDeleted(orgId, id, trx);
    if (!deleted) return undefined;

    await repo.deleteAccessByPerson(orgId, id, trx);

    if (deleted.employee_id) {
      await trx
        .updateTable("employee")
        .set({
          employee_no: null,
          deleted_at: new Date(),
          updated_at: new Date(),
        })
        .where("id", "=", deleted.employee_id)
        .where("organization_id", "=", orgId)
        .where("deleted_at", "is", null)
        .execute();

      await repo.clearEmployeeId(orgId, id, trx);
    }

    return deleted;
  });

  if (!row) throw new AppError("PERSON_NOT_FOUND");

  if (row.user_id) {
    await revokeOrganizationSessions(row.user_id, orgId);
  }

  return { id: row.id };
}
