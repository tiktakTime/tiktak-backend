import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";

import { DateOnlySchema, IdParamSchema, IsoInstantSchema } from "@/core/fields";
import { PaginationQuerySchema } from "@/core/http";
import {
  UserGender,
  type UserProfile,
  type User as UserRow,
  UserStatus,
} from "@/modules/db";

const UserStatusSchema = z.enum(UserStatus);
const UserGenderSchema = z.enum(UserGender);

/** User satırı + profil. Kimlik sırları ve push token telde yok. */
type UserPublic = Pick<
  Selectable<UserRow>,
  | "id"
  | "system_role_id"
  | "email"
  | "status"
  | "first_name"
  | "last_name"
  | "display_name"
  | "picture"
  | "locale"
  | "timezone"
  | "expires_at"
  | "email_verified_at"
  | "two_factor_enabled_at"
  | "created_at"
  | "updated_at"
> &
  Pick<
    Selectable<UserProfile>,
    | "country_id"
    | "nationality_id"
    | "gender"
    | "birth_location"
    | "birthdate"
    | "phone_landline"
    | "phone_number"
    | "phone_verified_at"
  >;

export const UserSchema = z
  .toZod<UserPublic>()(
    z.object({
      id: z.uuid(),
      system_role_id: z.uuid().nullable(),
      email: z.email().max(255).nullable(),
      status: UserStatusSchema,
      first_name: z.string().max(255),
      last_name: z.string().max(255),
      display_name: z.string().max(255).nullable(),
      picture: z.string().nullable(),
      locale: z.string().max(35).nullable(),
      timezone: z.string().max(64).nullable(),
      expires_at: z.date().nullable(),
      email_verified_at: z.date().nullable(),
      two_factor_enabled_at: z.date().nullable(),
      country_id: z.uuid().nullable(),
      nationality_id: z.uuid().nullable(),
      gender: UserGenderSchema,
      birth_location: z.string().max(255).nullable(),
      birthdate: z.coerce.date().nullable(),
      phone_landline: z.string().max(15).nullable(),
      phone_number: z.string().max(50).nullable(),
      phone_verified_at: z.date().nullable(),
      created_at: z.date(),
      updated_at: z.date(),
    }),
  )
  .openapi("User");

export const UserCreateSchema = z
  .object({
    country_id: z.uuid().nullable().optional(),
    nationality_id: z.uuid().nullable().optional(),
    first_name: z.string().trim().min(1).max(255),
    last_name: z.string().trim().min(1).max(255),
    display_name: z.string().max(255).nullable().optional(),
    email: z.email().max(255).optional(),
    password: z.string().max(255).nullable().optional(),
    phone_number: z.string().max(50).nullable().optional(),
    phone_landline: z.string().max(15).nullable().optional(),
    gender: UserGenderSchema.optional(),
    birth_location: z.string().max(255).nullable().optional(),
    birthdate: DateOnlySchema,
    picture: z.string().nullable().optional(),
    locale: z.string().max(35).nullable().optional(),
    timezone: z.string().max(64).nullable().optional(),
    status: UserStatusSchema.optional(),
    expires_at: IsoInstantSchema,
    email_verified_at: IsoInstantSchema.optional(),
    phone_verified_at: IsoInstantSchema.optional(),
    two_factor_enabled_at: IsoInstantSchema.optional(),
  })
  .openapi("UserCreate");

export const UserUpdateSchema = z
  .object({
    country_id: z.uuid().nullable().optional(),
    nationality_id: z.uuid().nullable().optional(),
    first_name: z.string().trim().min(1).max(255).optional(),
    last_name: z.string().trim().min(1).max(255).optional(),
    display_name: z.string().max(255).nullable().optional(),
    email: z.email().max(255).optional(),
    password: z.string().max(255).nullable().optional(),
    phone_number: z.string().max(50).nullable().optional(),
    phone_landline: z.string().max(15).nullable().optional(),
    gender: UserGenderSchema.optional(),
    birth_location: z.string().max(255).nullable().optional(),
    birthdate: DateOnlySchema,
    picture: z.string().nullable().optional(),
    locale: z.string().max(35).nullable().optional(),
    timezone: z.string().max(64).nullable().optional(),
    status: UserStatusSchema.optional(),
    expires_at: IsoInstantSchema,
    email_verified_at: IsoInstantSchema.optional(),
    phone_verified_at: IsoInstantSchema.optional(),
    two_factor_enabled_at: IsoInstantSchema.optional(),
  })
  .openapi("UserUpdate");

export const UserSearchQuerySchema = PaginationQuerySchema;
export const UserIdParamSchema = IdParamSchema;
export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserSearchQuery = z.infer<typeof UserSearchQuerySchema>;
