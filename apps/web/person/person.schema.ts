import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";

import { DateOnlySchema, IdParamSchema, IsoInstantSchema } from "@/core/fields";
import { PaginationQuerySchema } from "@/core/http";
import {
  PersonGender,
  type Person as PersonRow,
  PersonStatus,
} from "@/modules/db";

const PersonStatusSchema = z.enum(PersonStatus);

const PersonGenderSchema = z.enum(PersonGender);

const TaxClassSchema = z.enum([
  "0_employees_residing_abroad",
  "1_single_and_divorced_persons",
  "2_single_parents_and_separated_persons",
  "3_spouses_in_combination_with_tax_class_5",
  "4_spouses_with_equal_income",
  "5_spouses_in_combination_with_tax_class_3",
  "6_working_persons_with_a_secondary_job",
]);

const PersonMatchFieldSchema = z.enum([
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "phone_landline",
  "gender",
  "birthdate",
  "birth_location",
  "country_id",
  "nationality_id",
  "picture",
  "display_name",
  "driver_license_no",
  "driver_license_type",
  "driver_license_organization",
  "insurance_company",
  "insurance_no",
  "insurance_class",
  "health_insurance",
  "social_health_no",
  "tax_no",
  "tax_id",
  "tax_class",
  "child_exempt_amount",
  "address",
  "bank",
]);

type PersonPublic = Pick<
  Selectable<PersonRow>,
  | "id"
  | "organization_id"
  | "user_id"
  | "role_id"
  | "employee_id"
  | "country_id"
  | "nationality_id"
  | "first_name"
  | "last_name"
  | "display_name"
  | "email"
  | "gender"
  | "birth_location"
  | "birthdate"
  | "picture"
  | "phone_landline"
  | "phone_number"
  | "driver_license_no"
  | "driver_license_type"
  | "driver_license_organization"
  | "insurance_company"
  | "insurance_no"
  | "insurance_class"
  | "tax_no"
  | "tax_id"
  | "tax_class"
  | "child_exempt_amount"
  | "health_insurance"
  | "social_health_no"
  | "status"
  | "expired_date"
  | "created_at"
  | "updated_at"
>;

export const PersonSchema = z
  .toZod<PersonPublic>()(
    z.object({
      id: z.uuid(),
      organization_id: z.uuid(),
      user_id: z.uuid().nullable(),
      role_id: z.uuid().nullable(),
      employee_id: z.uuid().nullable(),
      country_id: z.uuid().nullable(),
      nationality_id: z.uuid().nullable(),
      first_name: z.string().max(255),
      last_name: z.string().max(255),
      display_name: z.string().max(255).nullable(),
      email: z.email().max(255).nullable(),
      gender: PersonGenderSchema,
      birth_location: z.string().max(255).nullable(),
      birthdate: z.coerce.date().nullable(),
      picture: z.string().nullable(),
      phone_landline: z.string().max(15).nullable(),
      phone_number: z.string().max(50).nullable(),
      driver_license_no: z.string().max(255).nullable(),
      driver_license_type: z.string().max(255).nullable(),
      driver_license_organization: z.string().max(255).nullable(),
      insurance_company: z.string().max(255).nullable(),
      insurance_no: z.string().max(255).nullable(),
      insurance_class: z.string().max(255).nullable(),
      tax_no: z.string().max(255).nullable(),
      tax_id: z.string().max(255).nullable(),
      tax_class: z.string().max(255).nullable(),
      child_exempt_amount: z.string().max(255).nullable(),
      health_insurance: z.string().max(255).nullable(),
      social_health_no: z.string().max(255).nullable(),
      status: PersonStatusSchema,
      expired_date: z.date().nullable(),
      created_at: z.date(),
      updated_at: z.date(),
    }),
  )
  .openapi("Person");

export const PersonCreateSchema = z
  .object({
    organization_id: z.uuid(),
    user_id: z.uuid().optional(),
    role_id: z.uuid().optional(),
    employee_id: z.uuid().optional(),
    country_id: z.uuid().optional(),
    nationality_id: z.uuid().optional(),
    first_name: z.string().trim().min(1).max(255),
    last_name: z.string().trim().min(1).max(255),
    display_name: z.string().max(255).nullable().optional(),
    email: z.email().max(255).nullable().optional(),
    gender: PersonGenderSchema.optional(),
    birth_location: z.string().max(255).nullable().optional(),
    birthdate: DateOnlySchema,
    picture: z.string().nullable().optional(),
    phone_landline: z.string().max(15).nullable().optional(),
    phone_number: z.string().max(50).nullable().optional(),
    driver_license_no: z.string().max(255).nullable().optional(),
    driver_license_type: z.string().max(255).nullable().optional(),
    driver_license_organization: z.string().max(255).nullable().optional(),
    insurance_company: z.string().max(255).nullable().optional(),
    insurance_no: z.string().max(255).nullable().optional(),
    insurance_class: z.string().max(255).nullable().optional(),
    health_insurance: z.string().max(255).nullable().optional(),
    social_health_no: z.string().max(255).nullable().optional(),
    tax_no: z.string().max(255).nullable().optional(),
    tax_id: z.string().max(255).nullable().optional(),
    tax_class: TaxClassSchema.nullable().optional(),
    child_exempt_amount: z.string().max(255).nullable().optional(),
    status: PersonStatusSchema.optional(),
    expired_date: IsoInstantSchema,
  })
  .openapi("PersonCreate");

export const PersonUpdateSchema = z
  .object({
    user_id: z.uuid().nullable().optional(),
    employee_id: z.uuid().nullable().optional(),
    country_id: z.uuid().nullable().optional(),
    nationality_id: z.uuid().nullable().optional(),
    first_name: z.string().trim().min(1).max(255).optional(),
    last_name: z.string().trim().min(1).max(255).optional(),
    display_name: z.string().max(255).nullable().optional(),
    email: z.email().max(255).nullable().optional(),
    gender: PersonGenderSchema.optional(),
    birth_location: z.string().max(255).nullable().optional(),
    birthdate: DateOnlySchema,
    picture: z.string().nullable().optional(),
    phone_landline: z.string().max(15).nullable().optional(),
    phone_number: z.string().max(50).nullable().optional(),
    driver_license_no: z.string().max(255).nullable().optional(),
    driver_license_type: z.string().max(255).nullable().optional(),
    driver_license_organization: z.string().max(255).nullable().optional(),
    insurance_company: z.string().max(255).nullable().optional(),
    insurance_no: z.string().max(255).nullable().optional(),
    insurance_class: z.string().max(255).nullable().optional(),
    health_insurance: z.string().max(255).nullable().optional(),
    social_health_no: z.string().max(255).nullable().optional(),
    tax_no: z.string().max(255).nullable().optional(),
    tax_id: z.string().max(255).nullable().optional(),
    tax_class: TaxClassSchema.nullable().optional(),
    child_exempt_amount: z.string().max(255).nullable().optional(),
    status: PersonStatusSchema.optional(),
    expired_date: IsoInstantSchema,
  })
  .openapi("PersonUpdate");

export const PersonSearchQuerySchema = PaginationQuerySchema.extend({
  organization_id: z.uuid(),
  role_id: z.uuid().optional(),
  status: PersonStatusSchema.optional(),
});

export const PersonSearchWithUserQuerySchema = z
  .object({
    email: z.email().max(255).optional(),
    first_name: z.string().trim().max(255).optional(),
    last_name: z.string().trim().max(255).optional(),
  })
  .refine((value) => !!(value.email || value.first_name || value.last_name));

export const PersonMatchWithUserBodySchema = z
  .object({
    fields: z.array(PersonMatchFieldSchema).min(1),
  })
  .openapi("PersonMatchWithUserBody");

export const PersonRolePermissionBodySchema = z
  .object({
    role_id: z.uuid().nullable().optional(),
    permissions: z.array(z.uuid()),
  })
  .openapi("PersonRolePermissionBody");

export const PersonCompareQuerySchema = z.object({
  user_id: z.uuid(),
});

export const PersonIdParamSchema = IdParamSchema;
export type Person = z.infer<typeof PersonSchema>;
export type PersonCreate = z.infer<typeof PersonCreateSchema>;
export type PersonUpdate = z.infer<typeof PersonUpdateSchema>;
export type PersonSearchQuery = z.infer<typeof PersonSearchQuerySchema>;
export type PersonSearchWithUserQuery = z.infer<
  typeof PersonSearchWithUserQuerySchema
>;
export type PersonMatchWithUserBody = z.infer<
  typeof PersonMatchWithUserBodySchema
>;
export type PersonRolePermissionBody = z.infer<
  typeof PersonRolePermissionBodySchema
>;
export type PersonCompareQuery = z.infer<typeof PersonCompareQuerySchema>;
