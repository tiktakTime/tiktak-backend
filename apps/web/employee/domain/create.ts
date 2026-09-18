import { AppError } from "@/core/errors";
import * as repo from "@/modules/employee/employee.repo";

import type { EmployeeCreate } from "../employee.schema";
import { allocateEmployeeNo } from "./employee-no";

export async function createEmployee(orgId: string, input: EmployeeCreate) {
  const existing = await repo.findActiveByPersonId(orgId, input.person_id);
  if (existing) {
    throw new AppError("EMPLOYEE_ALREADY_EXISTS");
  }

  const employeeNo = await allocateEmployeeNo(orgId, input.employee_no);

  return repo.insert({
    organization_id: orgId,
    person_id: input.person_id,
    experience_id: input.experience_id ?? null,
    employee_no: employeeNo,
  });
}
