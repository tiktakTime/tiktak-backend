import * as repo from "@/modules/employee/employee.repo";

import type { EmployeeSearchQuery } from "../employee.schema";

export async function searchEmployees(
  orgId: string,
  params: EmployeeSearchQuery,
) {
  return repo.search(orgId, params);
}
