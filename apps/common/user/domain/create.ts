import * as repo from "@/modules/user/user.repo";

import type { UserCreate } from "../user.schema";

export async function createUser(input: UserCreate) {
  const { gender, password: _pw, ...rest } = input;
  return repo.create({
    first_name: rest.first_name,
    last_name: rest.last_name,
    display_name: rest.display_name,
    email: rest.email,
    country_id: rest.country_id,
    nationality_id: rest.nationality_id,
    birth_location: rest.birth_location,
    birthdate: rest.birthdate,
    picture: rest.picture,
    locale: rest.locale,
    timezone: rest.timezone,
    phone_landline: rest.phone_landline,
    phone_number: rest.phone_number,
    status: rest.status,
    expires_at: rest.expires_at,
    email_verified_at: rest.email_verified_at
      ? new Date(rest.email_verified_at)
      : null,
    phone_verified_at: rest.phone_verified_at
      ? new Date(rest.phone_verified_at)
      : null,
    two_factor_enabled_at: rest.two_factor_enabled_at
      ? new Date(rest.two_factor_enabled_at)
      : null,
    gender:
      gender === "female" || gender === "male" || gender === "none"
        ? gender
        : "none",
  });
}
