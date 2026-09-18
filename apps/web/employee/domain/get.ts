import { AppError } from "@/core/errors";
import * as repo from "@/modules/employee/employee.repo";

export async function getEmployee(orgId: string, id: string) {
  const row = await repo.findById(orgId, id);
  if (!row) throw new AppError("EMPLOYEE_NOT_FOUND");
  return row;
}
