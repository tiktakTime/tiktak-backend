import { type PaginationParams, paginate, toPaginateSort } from "@/core/http";
import { db } from "@/modules/db";
import type { OrganizationBusinessType } from "@/modules/db";

export type OrganizationSearchParams = PaginationParams & {
  q?: string;
  sort?: string;
  order?: "ASC" | "DESC";
};

export type { OrganizationBusinessType };

export type OrganizationUpdateInput = Record<string, unknown>;

/** Global owner role id — humans seed ile aynı. */
export const OWNER_ROLE_ID = "056aa378-1422-41a3-b9f3-a6c02d365232";

export const COLUMNS = [
  "id",
  "country_id",
  "unique_id",
  "company_name",
  "first_name",
  "last_name",
  "business_type",
  "legal_form",
  "established_date",
  "email",
  "phone_landline",
  "phone_number",
  "fax",
  "website",
  "company_no",
  "tax_id",
  "vat_id",
  "bin",
  "trade_license_no",
  "commercial_register_no",
  "eori_number",
  "register_court",
  "account_holder",
  "industry_category",
  "image",
  "about",
  "status",
  "expired_date",
  "owner_id",
  "created_at",
  "updated_at",
] as const;

/** Kimliğe göre getir. */
export async function findById(id: string) {
  return db
    .selectFrom("organization")
    .select(COLUMNS)
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Silinmiş dahil getir. */
export async function findByIdAny(id: string) {
  return db
    .selectFrom("organization")
    .select([...COLUMNS, "deleted_at"])
    .where("id", "=", id)
    .executeTakeFirst();
}

/** Aktif org adı çakışması. */
export async function findActiveByCompanyName(companyName: string) {
  return db
    .selectFrom("organization")
    .select("id")
    .where("company_name", "=", companyName)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Sayfalayarak listele. */
export async function search({
  page,
  limit,
  q,
  sort,
  order,
}: OrganizationSearchParams) {
  let query = db.selectFrom("organization").where("deleted_at", "is", null);

  if (q) {
    const pattern = `%${q}%`;
    query = query.where((eb) =>
      eb.or([
        eb("company_name", "ilike", pattern),
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

/** Insert (transaction içinden de çağrılabilir — trx geç). */
export async function insert(
  values: {
    company_name: string;
    first_name: string;
    last_name: string;
    business_type: OrganizationBusinessType;
    owner_id: string;
    status?: "active" | "inactive" | "blocked";
  },
  trx: typeof db = db,
) {
  return trx
    .insertInto("organization")
    .values({
      company_name: values.company_name,
      first_name: values.first_name,
      last_name: values.last_name,
      business_type: values.business_type,
      owner_id: values.owner_id,
      status: values.status ?? "active",
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Güncelle. */
export async function update(id: string, input: OrganizationUpdateInput) {
  return db
    .updateTable("organization")
    .set({ ...(input as Record<string, never>), updated_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returning(COLUMNS)
    .executeTakeFirst();
}

/** Soft-delete. */
export async function softDelete(id: string) {
  return db
    .updateTable("organization")
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returning(["id"])
    .executeTakeFirst();
}

/** Soft-delete geri al (koşulsuz update). */
export async function clearDeletedAt(id: string) {
  return db
    .updateTable("organization")
    .set({ deleted_at: null, updated_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is not", null)
    .returning(COLUMNS)
    .executeTakeFirst();
}
