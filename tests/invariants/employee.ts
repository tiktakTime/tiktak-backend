import { sql } from "kysely";

import { db } from "@/modules/db";

async function ids(
  query: ReturnType<typeof sql<{ id: string }>>,
): Promise<string[]> {
  const result = await query.execute(db);
  return result.rows.map((row) => row.id);
}

/**
 * Employee + person değişmezleri. Kodun bir dalından değil, sistemin
 * bütününden gelir. İhlalde hangi kuralın kırıldığını söyler.
 */
export async function assertInvariants(orgId: string): Promise<void> {
  const problems: string[] = [];

  const orphans = await ids(sql<{ id: string }>`
    SELECT e.id
    FROM employee e
    LEFT JOIN person p
      ON p.id = e.person_id
     AND p.organization_id = e.organization_id
     AND p.deleted_at IS NULL
    WHERE e.organization_id = ${orgId}
      AND e.deleted_at IS NULL
      AND p.id IS NULL
  `);
  if (orphans.length > 0) {
    problems.push(`aktif employee'nin person'ı yok: ${orphans.join(", ")}`);
  }

  const extra = await sql<{ person_id: string }>`
    SELECT person_id
    FROM employee
    WHERE organization_id = ${orgId}
      AND deleted_at IS NULL
    GROUP BY person_id
    HAVING count(*) > 1
  `.execute(db);
  if (extra.rows.length > 0) {
    problems.push(
      `bir person'da birden fazla aktif employee: ${extra.rows.map((row) => row.person_id).join(", ")}`,
    );
  }

  const brokenLinks = await ids(sql<{ id: string }>`
    SELECT e.id
    FROM employee e
    JOIN person p ON p.id = e.person_id
    WHERE e.organization_id = ${orgId}
      AND e.deleted_at IS NULL
      AND p.employee_id IS DISTINCT FROM e.id
  `);
  if (brokenLinks.length > 0) {
    problems.push(
      `employee.person_id ile person.employee_id birbirini göstermiyor: ${brokenLinks.join(", ")}`,
    );
  }

  const dangling = await ids(sql<{ id: string }>`
    SELECT p.id
    FROM person p
    WHERE p.organization_id = ${orgId}
      AND p.deleted_at IS NULL
      AND p.employee_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM employee e
        WHERE e.id = p.employee_id
          AND e.person_id = p.id
          AND e.organization_id = p.organization_id
          AND e.deleted_at IS NULL
      )
  `);
  if (dangling.length > 0) {
    problems.push(
      `person.employee_id aktif employee'ye bağlı değil: ${dangling.join(", ")}`,
    );
  }

  const duplicateNos = await sql<{ employee_no: number }>`
    SELECT employee_no
    FROM employee
    WHERE organization_id = ${orgId}
      AND deleted_at IS NULL
      AND employee_no IS NOT NULL
    GROUP BY employee_no
    HAVING count(*) > 1
  `.execute(db);
  if (duplicateNos.rows.length > 0) {
    problems.push(
      `aktif employee_no tekrar ediyor: ${duplicateNos.rows.map((row) => row.employee_no).join(", ")}`,
    );
  }

  const held = await ids(sql<{ id: string }>`
    SELECT id
    FROM employee
    WHERE organization_id = ${orgId}
      AND deleted_at IS NOT NULL
      AND employee_no IS NOT NULL
  `);
  if (held.length > 0) {
    problems.push(`silinmiş employee numarayı bırakmamış: ${held.join(", ")}`);
  }

  if (problems.length > 0) {
    throw new Error(problems.join("\n"));
  }
}
