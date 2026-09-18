import { AppError } from "@/core/errors";
import { db } from "@/modules/db";
import * as employeeRepo from "@/modules/employee/employee.repo";
import * as personRepo from "@/modules/person/person.repo";
import * as userRepo from "@/modules/user/user.repo";

import type { EmployeeCreator } from "../employee.schema";
import { allocateEmployeeNo } from "./employee-no";

/**
 * v1 creator: resolve/create person + create/restore employee.
 * Company/experience fields are ignored; experience_id stays null.
 */
export async function createEmployeeViaCreator(
  orgId: string,
  input: EmployeeCreator,
) {
  return db.transaction().execute(async (trx) => {
    const person = await resolvePerson(orgId, input, trx);
    const employee = await assertOrRestoreEmployee(
      orgId,
      person.id,
      input.employee_no,
      trx,
    );

    await personRepo.setEmployeeId(orgId, person.id, employee.id, trx);

    return { employee, person };
  });
}

/** İsim zorunluluğu — creator kayıt açacaksa ad/soyad şart. */
function assertNames(input: EmployeeCreator): {
  first_name: string;
  last_name: string;
} {
  if (!input.first_name || !input.last_name) {
    throw new AppError("CREATOR_REQUIRES_NAME");
  }
  return { first_name: input.first_name, last_name: input.last_name };
}

async function requireUserNames(userId: string) {
  const user = await userRepo.findNameEmailById(userId);
  if (!user) throw new AppError("USER_NOT_FOUND");
  return user;
}

/** `user_id` yolu: canlı kayıt → restore → yeni kayıt. */
async function personByUserId(orgId: string, userId: string, trx: typeof db) {
  const existing = await personRepo.findByUserIdAny(orgId, userId);
  if (existing && !existing.deleted_at) return existing;

  const user = await requireUserNames(userId);

  if (existing?.deleted_at) {
    return personRepo.restoreAndUpdate(
      existing.id,
      {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        status: "active",
      },
      trx,
    );
  }

  return personRepo.insert(
    {
      organization_id: orgId,
      user_id: userId,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      status: "active",
    },
    trx,
  );
}

/**
 * E-posta yolu: canlı kayıt varsa onu döner, soft-deleted varsa restore eder.
 * Eşleşme yoksa `undefined` — çağıran yeni kayıt açar.
 */
async function personByEmail(
  orgId: string,
  email: string,
  input: EmployeeCreator,
  trx: typeof db,
) {
  const existing = await personRepo.findByEmailAny(orgId, email);
  if (!existing) return undefined;

  if (!existing.deleted_at) {
    return personRepo.findById(orgId, existing.id);
  }

  const names = assertNames(input);
  return personRepo.restoreAndUpdate(
    existing.id,
    { ...names, email, status: "active" },
    trx,
  );
}

async function resolvePerson(
  orgId: string,
  input: EmployeeCreator,
  trx: typeof db,
) {
  if (input.person_id) {
    const person = await personRepo.findById(orgId, input.person_id);
    if (!person) throw new AppError("PERSON_NOT_FOUND");
    return person;
  }

  if (input.user_id) {
    return personByUserId(orgId, input.user_id, trx);
  }

  const email = input.email ?? null;
  if (email) {
    const matched = await personByEmail(orgId, email, input, trx);
    if (matched) return matched;
  }

  return personRepo.insert(
    {
      organization_id: orgId,
      ...assertNames(input),
      email,
      status: "active",
    },
    trx,
  );
}

async function assertOrRestoreEmployee(
  orgId: string,
  personId: string,
  desiredNo: number | null | undefined,
  trx: typeof db,
) {
  const existing = await employeeRepo.findByPersonIdAny(orgId, personId);

  if (existing && !existing.deleted_at) {
    throw new AppError("EMPLOYEE_ALREADY_EXISTS");
  }

  const employeeNo = await allocateEmployeeNo(orgId, desiredNo);

  if (existing?.deleted_at) {
    return employeeRepo.restoreAndUpdate(
      orgId,
      existing.id,
      { employee_no: employeeNo, experience_id: null },
      trx,
    );
  }

  return employeeRepo.insert(
    {
      organization_id: orgId,
      person_id: personId,
      experience_id: null,
      employee_no: employeeNo,
    },
    trx,
  );
}
