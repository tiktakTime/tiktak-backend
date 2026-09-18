import { AppError } from "@/core/errors";
import * as repo from "@/modules/person/person.repo";
import * as userRepo from "@/modules/user/user.repo";

import type { PersonCreate } from "../person.schema";

/** Kayıtta tutulacak isim + e-posta; `user_id` verilmişse user kazanır. */
type Identity = { firstName: string; lastName: string; email: string | null };

async function resolveIdentity(
  input: PersonCreate,
  userId: string | null,
): Promise<Identity> {
  if (!userId) {
    return {
      firstName: input.first_name,
      lastName: input.last_name,
      email: input.email ?? null,
    };
  }

  const user = await userRepo.findNameEmailById(userId);
  if (!user) throw new AppError("USER_NOT_FOUND");

  return {
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  };
}

/** Soft-delete edilmiş kaydı yeniden canlandırırken yazılacak alanlar. */
function restorePatch(input: PersonCreate, identity: Identity) {
  return {
    first_name: identity.firstName,
    last_name: identity.lastName,
    email: identity.email,
    role_id: input.role_id ?? null,
    status: input.status ?? "inactive",
  };
}

/**
 * `user_id` çakışması: canlı kayıt varsa hata, soft-deleted varsa restore.
 * Dönen değer restore edilen kayıt veya `undefined` (devam et).
 */
async function reuseByUserId(
  orgId: string,
  userId: string,
  input: PersonCreate,
  identity: Identity,
) {
  const live = await repo.findByUserIdAny(orgId, userId);
  if (live && !live.deleted_at) throw new AppError("USER_ALREADY_EXISTS");
  if (!live?.deleted_at) return undefined;

  return repo.restoreAndUpdate(live.id, restorePatch(input, identity));
}

/** E-posta çakışması — aynı mantık; restore yalnızca `user_id` yoksa. */
async function reuseByEmail(
  orgId: string,
  email: string,
  userId: string | null,
  input: PersonCreate,
  identity: Identity,
) {
  const existing = await repo.findByEmailAny(orgId, email);
  if (existing && !existing.deleted_at) {
    throw new AppError("EMAIL_ALREADY_EXISTS");
  }
  if (!existing?.deleted_at || userId) return undefined;

  return repo.restoreAndUpdate(existing.id, restorePatch(input, identity));
}

function insertPayload(
  orgId: string,
  input: PersonCreate,
  userId: string | null,
  identity: Identity,
) {
  return {
    organization_id: orgId,
    user_id: userId,
    role_id: input.role_id ?? null,
    employee_id: input.employee_id ?? null,
    country_id: input.country_id ?? null,
    nationality_id: input.nationality_id ?? null,
    first_name: identity.firstName,
    last_name: identity.lastName,
    display_name: input.display_name ?? null,
    email: identity.email,
    gender: input.gender ?? "none",
    birth_location: input.birth_location ?? null,
    birthdate: input.birthdate ?? null,
    picture: input.picture ?? null,
    phone_landline: input.phone_landline ?? null,
    phone_number: input.phone_number ?? null,
    driver_license_no: input.driver_license_no ?? null,
    driver_license_type: input.driver_license_type ?? null,
    driver_license_organization: input.driver_license_organization ?? null,
    insurance_company: input.insurance_company ?? null,
    insurance_no: input.insurance_no ?? null,
    insurance_class: input.insurance_class ?? null,
    health_insurance: input.health_insurance ?? null,
    social_health_no: input.social_health_no ?? null,
    tax_no: input.tax_no ?? null,
    tax_id: input.tax_id ?? null,
    tax_class: input.tax_class ?? null,
    child_exempt_amount: input.child_exempt_amount ?? null,
    status: input.status ?? "inactive",
    expired_date: input.expired_date ? new Date(input.expired_date) : null,
  };
}

export async function createPerson(orgId: string, input: PersonCreate) {
  const userId = input.user_id ?? null;
  const identity = await resolveIdentity(input, userId);

  if (userId) {
    const restored = await reuseByUserId(orgId, userId, input, identity);
    if (restored) return restored;
  }

  if (identity.email) {
    const restored = await reuseByEmail(
      orgId,
      identity.email,
      userId,
      input,
      identity,
    );
    if (restored) return restored;
  }

  return repo.insert(insertPayload(orgId, input, userId, identity));
}
