import { type PaginationParams, paginate, toPaginateSort } from "@/core/http";
import { db } from "@/modules/db";

export type CountrySearchParams = PaginationParams & {
  q?: string;
  region?: string;
  subregion?: string;
  sort?: string;
  order?: "ASC" | "DESC";
};

export type CountryInsertInput = {
  name: string;
  iso: string;
  native_name?: string | null;
  official_name?: string | null;
  phone_code?: string | null;
  currency_code?: string | null;
  currency_symbol?: string | null;
  region?: string | null;
  subregion?: string | null;
  capital?: string | null;
  timezones?: string[];
};

export type CountryUpdateInput = Partial<CountryInsertInput>;

export const COLUMNS = [
  "id",
  "name",
  "native_name",
  "official_name",
  "iso",
  "phone_code",
  "currency_code",
  "currency_symbol",
  "region",
  "subregion",
  "capital",
  "timezones",
  "created_at",
  "updated_at",
] as const;

/** Kimliğe göre getir. */
export async function findById(id: string) {
  return db
    .selectFrom("country")
    .select(COLUMNS)
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** ISO-3166 alpha-2. */
export async function findByIso(iso: string) {
  return db
    .selectFrom("country")
    .select(COLUMNS)
    .where("iso", "=", iso.toUpperCase())
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Sayfalayarak listele. */
export async function search(params: CountrySearchParams) {
  const { page, limit, q, region, subregion, sort, order } = params;
  let query = db.selectFrom("country").where("deleted_at", "is", null);

  if (region) query = query.where("region", "=", region);
  if (subregion) query = query.where("subregion", "=", subregion);
  if (q) {
    const pattern = `%${q}%`;
    query = query.where((eb) =>
      eb.or([
        eb("name", "ilike", pattern),
        eb("native_name", "ilike", pattern),
        eb("official_name", "ilike", pattern),
        eb("iso", "ilike", pattern),
      ]),
    );
  }

  return paginate(
    query.select(COLUMNS).orderBy("name", "asc"),
    { page, limit, ...toPaginateSort({ sort, order, orderBy: "name" }) },
    ["name", "iso", "created_at"],
  );
}

/** Insert. */
export async function insert(input: CountryInsertInput) {
  return db
    .insertInto("country")
    .values({
      name: input.name,
      iso: input.iso.toUpperCase(),
      native_name: input.native_name ?? null,
      official_name: input.official_name ?? null,
      phone_code: input.phone_code ?? null,
      currency_code: input.currency_code ?? null,
      currency_symbol: input.currency_symbol ?? null,
      region: input.region ?? null,
      subregion: input.subregion ?? null,
      capital: input.capital ?? null,
      timezones: input.timezones ?? [],
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Güncelle. */
export async function update(id: string, input: CountryUpdateInput) {
  const { iso, ...rest } = input;
  return db
    .updateTable("country")
    .set({
      ...rest,
      ...(iso !== undefined ? { iso: iso.toUpperCase() } : {}),
      updated_at: new Date(),
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returning(COLUMNS)
    .executeTakeFirst();
}

/** Soft-delete. */
export async function softDelete(id: string, deletedById?: string | null) {
  return db
    .updateTable("country")
    .set({
      deleted_at: new Date(),
      updated_at: new Date(),
      deleted_by_id: deletedById ?? null,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returning(["id"])
    .executeTakeFirst();
}
