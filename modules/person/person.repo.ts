import { type PaginationParams, paginate, toPaginateSort } from "@/core/http";
import { db } from "@/modules/db";

export type PersonSearchParams = PaginationParams & {
  q?: string;
  role_id?: string;
  status?: string;
  sort?: string;
  order?: "ASC" | "DESC";
};

export type PersonGender = "female" | "male" | "other" | "none";
export type PersonStatus = "active" | "inactive" | "blocked";

export type PersonUpdateInput = {
  user_id?: string | null;
  employee_id?: string | null;
  country_id?: string | null;
  nationality_id?: string | null;
  first_name?: string;
  last_name?: string;
  display_name?: string | null;
  email?: string | null;
  gender?: PersonGender;
  birth_location?: string | null;
  birthdate?: string | null;
  picture?: string | null;
  phone_landline?: string | null;
  phone_number?: string | null;
  driver_license_no?: string | null;
  driver_license_type?: string | null;
  driver_license_organization?: string | null;
  insurance_company?: string | null;
  insurance_no?: string | null;
  insurance_class?: string | null;
  health_insurance?: string | null;
  social_health_no?: string | null;
  tax_no?: string | null;
  tax_id?: string | null;
  tax_class?: string | null;
  child_exempt_amount?: string | null;
  status?: PersonStatus;
  expired_date?: string | Date | null;
};

export const COLUMNS = [
  "id",
  "organization_id",
  "user_id",
  "role_id",
  "employee_id",
  "country_id",
  "nationality_id",
  "first_name",
  "last_name",
  "display_name",
  "email",
  "gender",
  "birth_location",
  "birthdate",
  "picture",
  "phone_landline",
  "phone_number",
  "driver_license_no",
  "driver_license_type",
  "driver_license_organization",
  "insurance_company",
  "insurance_no",
  "insurance_class",
  "tax_no",
  "tax_id",
  "tax_class",
  "child_exempt_amount",
  "health_insurance",
  "social_health_no",
  "status",
  "expired_date",
  "created_at",
  "updated_at",
] as const;

type Executor = typeof db;

/** Kimliğe göre org kapsamında getir. */
export async function findById(orgId: string, id: string) {
  return db
    .selectFrom("person")
    .select(COLUMNS)
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Silinmiş dahil. */
export async function findByIdAny(orgId: string, id: string) {
  return db
    .selectFrom("person")
    .select(["id", "deleted_at"])
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .executeTakeFirst();
}

/** Org + user_id (silinmiş dahil). */
export async function findByUserIdAny(orgId: string, userId: string) {
  return db
    .selectFrom("person")
    .select([...COLUMNS, "deleted_at"])
    .where("organization_id", "=", orgId)
    .where("user_id", "=", userId)
    .executeTakeFirst();
}

/** Org + email (silinmiş dahil). */
export async function findByEmailAny(orgId: string, email: string) {
  return db
    .selectFrom("person")
    .select(["id", "deleted_at"])
    .where("organization_id", "=", orgId)
    .where("email", "=", email)
    .executeTakeFirst();
}

/** Org + user_id aktif. */
export async function findActiveByUserId(orgId: string, userId: string) {
  return db
    .selectFrom("person")
    .select([
      "id",
      "role_id",
      "status",
      "expired_date",
      "user_id",
      "employee_id",
    ])
    .where("organization_id", "=", orgId)
    .where("user_id", "=", userId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Sayfalayarak listele. */
export async function search(orgId: string, params: PersonSearchParams) {
  const { page, limit, q, role_id, status, sort, order } = params;
  let query = db
    .selectFrom("person")
    .where("deleted_at", "is", null)
    .where("organization_id", "=", orgId);

  if (role_id) query = query.where("role_id", "=", role_id);
  if (status) query = query.where("status", "=", status as PersonStatus);
  if (q) {
    const pattern = `%${q}%`;
    query = query.where((eb) =>
      eb.or([
        eb("first_name", "ilike", pattern),
        eb("last_name", "ilike", pattern),
        eb("email", "ilike", pattern),
      ]),
    );
  }

  return paginate(
    query.select(COLUMNS).orderBy("created_at", "desc"),
    { page, limit, ...toPaginateSort({ sort, order }) },
    ["created_at"],
  );
}

export type PersonInsertValues = {
  organization_id: string;
  user_id?: string | null;
  role_id?: string | null;
  employee_id?: string | null;
  country_id?: string | null;
  nationality_id?: string | null;
  first_name: string;
  last_name: string;
  display_name?: string | null;
  email?: string | null;
  gender?: PersonGender;
  birth_location?: string | null;
  birthdate?: string | null;
  picture?: string | null;
  phone_landline?: string | null;
  phone_number?: string | null;
  driver_license_no?: string | null;
  driver_license_type?: string | null;
  driver_license_organization?: string | null;
  insurance_company?: string | null;
  insurance_no?: string | null;
  insurance_class?: string | null;
  health_insurance?: string | null;
  social_health_no?: string | null;
  tax_no?: string | null;
  tax_id?: string | null;
  tax_class?: string | null;
  child_exempt_amount?: string | null;
  status?: PersonStatus;
  expired_date?: Date | null;
};

/** Insert. */
export async function insert(values: PersonInsertValues, trx: Executor = db) {
  return trx
    .insertInto("person")
    .values({
      organization_id: values.organization_id,
      user_id: values.user_id ?? null,
      role_id: values.role_id ?? null,
      employee_id: values.employee_id ?? null,
      country_id: values.country_id ?? null,
      nationality_id: values.nationality_id ?? null,
      first_name: values.first_name,
      last_name: values.last_name,
      display_name: values.display_name ?? null,
      email: values.email ?? null,
      gender: values.gender ?? "none",
      birth_location: values.birth_location ?? null,
      birthdate: values.birthdate ?? null,
      picture: values.picture ?? null,
      phone_landline: values.phone_landline ?? null,
      phone_number: values.phone_number ?? null,
      driver_license_no: values.driver_license_no ?? null,
      driver_license_type: values.driver_license_type ?? null,
      driver_license_organization: values.driver_license_organization ?? null,
      insurance_company: values.insurance_company ?? null,
      insurance_no: values.insurance_no ?? null,
      insurance_class: values.insurance_class ?? null,
      health_insurance: values.health_insurance ?? null,
      social_health_no: values.social_health_no ?? null,
      tax_no: values.tax_no ?? null,
      tax_id: values.tax_id ?? null,
      tax_class: values.tax_class ?? null,
      child_exempt_amount: values.child_exempt_amount ?? null,
      status: values.status ?? "inactive",
      expired_date: values.expired_date ?? null,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Soft-deleted kaydı geri getir / alanları güncelle. */
export async function restoreAndUpdate(
  id: string,
  patch: {
    first_name: string;
    last_name: string;
    email: string | null;
    role_id?: string | null;
    status?: PersonStatus;
  },
  trx: Executor = db,
) {
  return trx
    .updateTable("person")
    .set({
      deleted_at: null,
      first_name: patch.first_name,
      last_name: patch.last_name,
      email: patch.email,
      role_id: patch.role_id ?? null,
      status: patch.status ?? "inactive",
      updated_at: new Date(),
    })
    .where("id", "=", id)
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Güncelle (org scope). */
export async function update(
  orgId: string,
  id: string,
  input: PersonUpdateInput,
) {
  const { expired_date, ...rest } = input;
  return db
    .updateTable("person")
    .set({
      ...rest,
      ...(expired_date !== undefined
        ? { expired_date: expired_date ? new Date(expired_date) : null }
        : {}),
      updated_at: new Date(),
    })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .returning(COLUMNS)
    .executeTakeFirst();
}

/** Soft-delete satırı. */
export async function markDeleted(
  orgId: string,
  id: string,
  trx: Executor = db,
) {
  return trx
    .updateTable("person")
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .returning(["id", "user_id", "employee_id"])
    .executeTakeFirst();
}

/** employee_id temizle. */
export async function clearEmployeeId(
  orgId: string,
  id: string,
  trx: Executor = db,
) {
  return trx
    .updateTable("person")
    .set({ employee_id: null, updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .execute();
}

/** employee_id bağla. */
export async function setEmployeeId(
  orgId: string,
  id: string,
  employeeId: string,
  trx: Executor = db,
) {
  return trx
    .updateTable("person")
    .set({ employee_id: employeeId, updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .execute();
}

/** Soft-delete geri al. */
export async function clearDeletedAt(orgId: string, id: string) {
  return db
    .updateTable("person")
    .set({ deleted_at: null, updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is not", null)
    .returning(COLUMNS)
    .executeTakeFirst();
}

/** Access status sync. */
export async function syncAccessStatus(
  orgId: string,
  personId: string,
  status: "active" | "inactive" | "blocked",
) {
  return db
    .updateTable("access")
    .set({ status, updated_at: new Date() })
    .where("person_id", "=", personId)
    .where("organization_id", "=", orgId)
    .where("status", "in", ["active", "inactive", "blocked"])
    .execute();
}

/** Access satırlarını sil. */
export async function deleteAccessByPerson(
  orgId: string,
  personId: string,
  trx: Executor = db,
) {
  return trx
    .deleteFrom("access")
    .where("person_id", "=", personId)
    .where("organization_id", "=", orgId)
    .execute();
}
