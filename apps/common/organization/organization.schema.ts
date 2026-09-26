import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";

import { DateOnlySchema, IdParamSchema, IsoInstantSchema } from "@/core/fields";
import { PaginationQuerySchema } from "@/core/http";
import {
  OrganizationBusinessType,
  OrganizationLegalForm,
  type Organization as OrganizationRow,
  OrganizationStatus,
} from "@/modules/db";

const OrganizationStatusSchema = z.enum(OrganizationStatus);

const OrganizationBusinessTypeSchema = z.enum(OrganizationBusinessType);

const OrganizationLegalFormSchema = z.enum(OrganizationLegalForm);

type OrganizationPublic = Pick<
  Selectable<OrganizationRow>,
  | "id"
  | "country_id"
  | "unique_id"
  | "company_name"
  | "first_name"
  | "last_name"
  | "business_type"
  | "legal_form"
  | "established_date"
  | "email"
  | "phone_landline"
  | "phone_number"
  | "fax"
  | "website"
  | "company_no"
  | "tax_id"
  | "vat_id"
  | "bin"
  | "trade_license_no"
  | "commercial_register_no"
  | "eori_number"
  | "register_court"
  | "account_holder"
  | "industry_category"
  | "image"
  | "about"
  | "status"
  | "expired_date"
  | "owner_id"
  | "created_at"
  | "updated_at"
>;

export const OrganizationSchema = z
  .toZod<OrganizationPublic>()(
    z.object({
      id: z.uuid(),
      country_id: z.uuid().nullable(),
      unique_id: z.string().nullable(),
      company_name: z.string().max(255).nullable(),
      first_name: z.string().max(255).nullable(),
      last_name: z.string().max(255).nullable(),
      business_type: OrganizationBusinessTypeSchema,
      legal_form: OrganizationLegalFormSchema.nullable(),
      established_date: z.coerce.date().nullable(),
      email: z.email().max(255).nullable(),
      phone_landline: z.string().max(15).nullable(),
      phone_number: z.string().max(50).nullable(),
      fax: z.string().max(50).nullable(),
      website: z.string().max(255).nullable(),
      company_no: z.string().max(255).nullable(),
      tax_id: z.string().max(255).nullable(),
      vat_id: z.string().max(255).nullable(),
      bin: z.string().max(255).nullable(),
      trade_license_no: z.string().max(255).nullable(),
      commercial_register_no: z.string().max(255).nullable(),
      eori_number: z.string().max(255).nullable(),
      register_court: z.string().max(255).nullable(),
      account_holder: z.string().max(255).nullable(),
      industry_category: z.string().max(255).nullable(),
      image: z.string().nullable(),
      about: z.string().nullable(),
      status: OrganizationStatusSchema,
      expired_date: z.date().nullable(),
      owner_id: z.uuid().nullable(),
      created_at: z.date(),
      updated_at: z.date(),
    }),
  )
  .openapi("Organization");

export const OrganizationCreateSchema = z
  .object({
    company_name: z.string().trim().min(1).max(255),
    first_name: z.string().trim().max(255).optional(),
    last_name: z.string().trim().max(255).optional(),
    business_type: OrganizationBusinessTypeSchema,
  })
  .openapi("OrganizationCreate");

export const OrganizationUpdateSchema = z
  .object({
    country_id: z.uuid().nullable().optional(),
    unique_id: z.string().nullable().optional(),
    company_name: z.string().trim().max(255).nullable().optional(),
    first_name: z.string().trim().max(255).nullable().optional(),
    last_name: z.string().trim().max(255).nullable().optional(),
    business_type: OrganizationBusinessTypeSchema.optional(),
    legal_form: OrganizationLegalFormSchema.nullable().optional(),
    established_date: DateOnlySchema,
    email: z.email().max(255).nullable().optional(),
    phone_landline: z.string().max(15).nullable().optional(),
    phone_number: z.string().max(50).nullable().optional(),
    fax: z.string().max(50).nullable().optional(),
    website: z.url().max(255).nullable().optional(),
    company_no: z.string().max(255).nullable().optional(),
    tax_id: z.string().max(255).nullable().optional(),
    vat_id: z.string().max(255).nullable().optional(),
    bin: z.string().max(255).nullable().optional(),
    image: z.string().max(500).nullable().optional(),
    about: z.string().nullable().optional(),
    status: OrganizationStatusSchema.optional(),
    expired_date: IsoInstantSchema,
  })
  .openapi("OrganizationUpdate");

export const OrganizationSearchQuerySchema = PaginationQuerySchema;
export const OrganizationIdParamSchema = IdParamSchema;
export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationCreate = z.infer<typeof OrganizationCreateSchema>;
export type OrganizationUpdate = z.infer<typeof OrganizationUpdateSchema>;
export type OrganizationSearchQuery = z.infer<
  typeof OrganizationSearchQuerySchema
>;
