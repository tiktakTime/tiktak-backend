import { z } from "@hono/zod-openapi";

import { DateOnlySchema, IdParamSchema, IsoInstantSchema } from "@/core/fields";
import { PaginationQuerySchema } from "@/core/http";

const UserStatusSchema = z.enum(["active", "inactive", "blocked"]);
const UserGenderSchema = z.enum(["female", "male", "none"]);

/** Platform user on the wire. Secrets / push tokens never appear here. */
export const UserSchema = z
  .object({
    id: z.uuid(),
    system_role_id: z.uuid().nullable().optional(),
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
    birthdate: z.string().nullable(),
    phone_landline: z.string().max(15).nullable(),
    phone_number: z.string().max(50).nullable(),
    phone_verified_at: z.date().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
  })
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
