import { sql } from "kysely";

import { type PaginationParams, paginate, toPaginateSort } from "@/core/http";
import { db } from "@/modules/db";

export type EmployeeSearchParams = PaginationParams & {
  q?: string;
  role_id?: string;
  person_status?: string;
  experience_types?: string[];
  exclude_experience_types?: string[];
  company_id?: string;
  start_date?: string | null;
  end_date?: string | null;
  sort?: string;
  order?: "ASC" | "DESC";
};

export type EmployeeUpdateInput = {
  experience_id?: string | null;
  exit_date?: string | Date | null;
  employee_no?: number | null;
};

export const COLUMNS = [
  "id",
  "organization_id",
  "person_id",
  "experience_id",
  "exit_date",
  "employee_no",
  "created_at",
  "updated_at",
] as const;

type Executor = typeof db;

/** Kimliğe göre org kapsamında getir. */
export async function findById(orgId: string, id: string) {
  return db
    .selectFrom("employee")
    .select(COLUMNS)
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Aktif employee by person. */
export async function findActiveByPersonId(orgId: string, personId: string) {
  return db
    .selectFrom("employee")
    .select(COLUMNS)
    .where("organization_id", "=", orgId)
    .where("person_id", "=", personId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Person için herhangi (silinmiş dahil). */
export async function findByPersonIdAny(orgId: string, personId: string) {
  return db
    .selectFrom("employee")
    .select([...COLUMNS, "deleted_at"])
    .where("organization_id", "=", orgId)
    .where("person_id", "=", personId)
    .executeTakeFirst();
}

/** Sayfalayarak listele. */
export async function search(orgId: string, params: EmployeeSearchParams) {
  const { page, limit, sort, order } = params;

  void params.q;
  void params.role_id;
  void params.person_status;
  void params.experience_types;
  void params.exclude_experience_types;
  void params.company_id;
  void params.start_date;
  void params.end_date;

  const query = db
    .selectFrom("employee")
    .where("deleted_at", "is", null)
    .where("organization_id", "=", orgId);

  return paginate(
    query.select(COLUMNS).orderBy("created_at", "desc"),
    { page, limit, ...toPaginateSort({ sort, order }) },
    ["created_at"],
  );
}

/** Insert. */
export async function insert(
  values: {
    organization_id: string;
    person_id: string;
    experience_id?: string | null;
    employee_no?: number | null;
  },
  trx: Executor = db,
) {
  return trx
    .insertInto("employee")
    .values({
      organization_id: values.organization_id,
      person_id: values.person_id,
      experience_id: values.experience_id ?? null,
      employee_no: values.employee_no ?? null,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Soft-deleted employee restore + patch. */
export async function restoreAndUpdate(
  orgId: string,
  id: string,
  patch: {
    employee_no: number | null;
    experience_id?: string | null;
  },
  trx: Executor = db,
) {
  return trx
    .updateTable("employee")
    .set({
      deleted_at: null,
      employee_no: patch.employee_no,
      experience_id: patch.experience_id ?? null,
      updated_at: new Date(),
    })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Güncelle. */
export async function update(
  orgId: string,
  id: string,
  input: EmployeeUpdateInput,
) {
  return db
    .updateTable("employee")
    .set({ ...input, updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .returning(COLUMNS)
    .executeTakeFirst();
}

/** Soft-delete steps (caller orchestrates transaction). */
export async function clearEmployeeNo(id: string, trx: Executor = db) {
  return trx
    .updateTable("employee")
    .set({ employee_no: null, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function markDeleted(
  orgId: string,
  id: string,
  trx: Executor = db,
) {
  return trx
    .updateTable("employee")
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .returning(["id"])
    .executeTakeFirst();
}

export async function clearPersonEmployeeLink(
  orgId: string,
  employeeId: string,
  trx: Executor = db,
) {
  return trx
    .updateTable("person")
    .set({ employee_id: null, updated_at: new Date() })
    .where("employee_id", "=", employeeId)
    .where("organization_id", "=", orgId)
    .execute();
}

/**
 * Gap-fill: floor = MIN(employee_no > 0); next = smallest free ≥ floor.
 * Empty org → 1.
 */
export async function nextEmployeeNo(organizationId: string) {
  const result = await sql<{ next_no: number | string | null }>`
    WITH bounds AS (
      SELECT MIN(employee_no) AS floor_no
        FROM employee
       WHERE organization_id = ${organizationId}::uuid
         AND employee_no > 0
    ),
    occupied AS (
      SELECT employee_no
        FROM employee
       WHERE organization_id = ${organizationId}::uuid
         AND employee_no IS NOT NULL
         AND employee_no > 0
         AND deleted_at IS NULL
    ),
    candidates AS (
      SELECT floor_no AS candidate_no FROM bounds WHERE floor_no IS NOT NULL
      UNION ALL
      SELECT employee_no + 1 FROM occupied
    )
    SELECT COALESCE(
      (
        SELECT MIN(c.candidate_no)
          FROM candidates c
         WHERE c.candidate_no >= (SELECT floor_no FROM bounds)
           AND NOT EXISTS (
             SELECT 1 FROM occupied o WHERE o.employee_no = c.candidate_no
           )
      ),
      1
    ) AS next_no
  `.execute(db);

  return Number(result.rows[0]?.next_no) || 1;
}

/** Çalışan numarasının organizasyonda kullanılıp kullanılmadığını kontrol et. */
export async function isEmployeeNoTaken(
  organizationId: string,
  desiredNo: number,
  excludeId?: string,
) {
  let query = db
    .selectFrom("employee")
    .select("id")
    .where("organization_id", "=", organizationId)
    .where("employee_no", "=", desiredNo)
    .where("deleted_at", "is", null);

  if (excludeId) query = query.where("id", "!=", excludeId);

  const row = await query.executeTakeFirst();
  return Boolean(row);
}

/** Soft-delete find for cascade. */
export async function findActiveIdPerson(
  orgId: string,
  id: string,
  trx: Executor = db,
) {
  return trx
    .selectFrom("employee")
    .select(["id", "person_id"])
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}
