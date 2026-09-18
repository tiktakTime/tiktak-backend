import { AppError } from "@/core/errors";
import { db } from "@/modules/db";
import * as repo from "@/modules/employee/employee.repo";

export async function softDeleteEmployee(orgId: string, id: string) {
  const row = await db.transaction().execute(async (trx) => {
    const existing = await repo.findActiveIdPerson(orgId, id, trx);
    if (!existing) return undefined;

    await repo.clearEmployeeNo(id, trx);
    const deleted = await repo.markDeleted(orgId, id, trx);
    await repo.clearPersonEmployeeLink(orgId, id, trx);
    return deleted;
  });

  if (!row) throw new AppError("EMPLOYEE_NOT_FOUND");
  return row;
}
