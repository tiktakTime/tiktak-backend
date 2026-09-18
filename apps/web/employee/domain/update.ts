import { AppError } from "@/core/errors";
import * as repo from "@/modules/employee/employee.repo";

import type { EmployeeUpdate } from "../employee.schema";
import { allocateEmployeeNo } from "./employee-no";

export async function updateEmployee(
  orgId: string,
  id: string,
  input: EmployeeUpdate,
) {
  if (input.employee_no != null) {
    await allocateEmployeeNo(orgId, input.employee_no, id);
  }

  const row = await repo.update(orgId, id, input);
  if (!row) throw new AppError("EMPLOYEE_NOT_FOUND");
  return row;
}
