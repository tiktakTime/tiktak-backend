import { AppError } from "@/core/errors";
import * as repo from "@/modules/employee/employee.repo";

export async function nextEmployeeNo(orgId: string) {
  return repo.nextEmployeeNo(orgId);
}

export async function isEmployeeNoTaken(
  orgId: string,
  desiredNo: number,
  excludeId?: string,
) {
  return repo.isEmployeeNoTaken(orgId, desiredNo, excludeId);
}

/** Resolve employee_no: auto-allocate or validate desired. */
export async function allocateEmployeeNo(
  orgId: string,
  desired?: number | null,
  excludeId?: string,
) {
  if (desired == null || desired === 0) {
    return repo.nextEmployeeNo(orgId);
  }
  if (await repo.isEmployeeNoTaken(orgId, desired, excludeId)) {
    throw new AppError("EMPLOYEE_NO_IN_USE", { no: desired });
  }
  return desired;
}
