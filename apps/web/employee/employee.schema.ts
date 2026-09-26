import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";

import { IdParamSchema, IsoInstantSchema } from "@/core/fields";
import { PaginationQuerySchema } from "@/core/http";
import {
  type Employee as EmployeeRow,
  OrganizationBusinessType,
  type Person,
  PersonStatus,
} from "@/modules/db";

const OrganizationBusinessTypeSchema = z.enum(OrganizationBusinessType);

const PersonStatusSchema = z.enum(PersonStatus);

const ExperienceTypeSchema = z.enum([
  "entry",
  "exit",
  "promotion",
  "demotion",
  "leave",
  "contract_change",
  "transfer",
  "suspension",
  "training",
]);

const ExperienceReasonSchema = z.enum([
  "first_entry",
  "re_entry",
  "other_entry",
  "mutual_termination",
  "fixed_term_end",
  "termination_by_employer",
  "termination_by_employee",
  "retirement",
  "other_exit",
  "tod",
  "role_change_up",
  "salary_increase",
  "title_promotion",
  "role_change_down",
  "disciplinary_demotion",
  "salary_reduction",
  "paid_leave",
  "unpaid_leave",
  "sick_leave",
  "maternity_leave",
  "parental_leave",
  "care_leave",
  "special_leave",
  "education_leave",
  "strike",
  "unpaid_sabbatical",
  "paid_sabbatical",
  "fixed_to_permanent",
  "permanent_to_fixed",
  "runtime_model_switch",
  "location_type_switch",
  "department_transfer",
  "location_transfer",
  "internal_assignment",
  "job_rotation",
  "suspension",
  "administrative_leave",
  "garden_leave",
  "disciplinary_suspension",
  "training_assignment",
  "mentorship",
]);

const TypeOfEmploymentSchema = z.enum([
  "personal",
  "intern",
  "trainer",
  "project_based",
  "self_employed",
  "freelancer",
  "subcontractor",
  "temporary_staff",
]);

const RuntimeModelSchema = z.enum([
  "full_time",
  "part_time",
  "minijob",
  "midijob",
]);

const LocationTypeSchema = z.enum(["remote", "office", "hybrid", "field_work"]);

type EmployeePublic = Pick<
  Selectable<EmployeeRow>,
  | "id"
  | "organization_id"
  | "person_id"
  | "experience_id"
  | "exit_date"
  | "employee_no"
  | "created_at"
  | "updated_at"
>;

export const EmployeeSchema = z
  .toZod<EmployeePublic>()(
    z.object({
      id: z.uuid(),
      organization_id: z.uuid(),
      person_id: z.uuid(),
      experience_id: z.uuid().nullable(),
      exit_date: z.date().nullable(),
      employee_no: z.number().int().nullable(),
      created_at: z.date(),
      updated_at: z.date(),
    }),
  )
  .openapi("Employee");

export const EmployeeCreateSchema = z
  .object({
    organization_id: z.uuid(),
    person_id: z.uuid(),
    experience_id: z.uuid().optional(),
    employee_no: z.number().int().min(1).nullable().optional(),
  })
  .openapi("EmployeeCreate");

export const EmployeeUpdateSchema = z
  .object({
    person_id: z.uuid().optional(),
    experience_id: z.uuid().nullable().optional(),
    employee_no: z.number().int().min(1).nullable().optional(),
  })
  .openapi("EmployeeUpdate");

export const EmployeeSearchQuerySchema = PaginationQuerySchema.extend({
  organization_id: z.uuid(),
  person_status: PersonStatusSchema.optional(),
  role_id: z.uuid().optional(),
  company_id: z.uuid().optional(),
  experience_types: z.array(ExperienceTypeSchema).optional(),
  exclude_experience_types: z.array(ExperienceTypeSchema).optional(),
  start_date: IsoInstantSchema,
  end_date: IsoInstantSchema,
});

export const DesiredEmployeeNoQuerySchema = z.object({
  organization_id: z.uuid(),
  desired_no: z.coerce.number().int().min(1),
});

export const NextEmployeeNoQuerySchema = z.object({
  organization_id: z.uuid(),
});

type EmployeeCreatorInput = Partial<
  Pick<Selectable<Person>, "first_name" | "last_name" | "email">
> &
  Partial<Pick<Selectable<EmployeeRow>, "person_id" | "employee_no">> & {
    user_id?: string;
    company_id?: string;
    company_name?: string | null;
    business_type?: OrganizationBusinessType | null;
    type_of_employment: z.infer<typeof TypeOfEmploymentSchema>;
    title?: string | null;
    type?: z.infer<typeof ExperienceTypeSchema>;
    runtime_model?: z.infer<typeof RuntimeModelSchema> | null;
    location_type?: z.infer<typeof LocationTypeSchema> | null;
    reason?: z.infer<typeof ExperienceReasonSchema> | null;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    short_time_work?: boolean;
    insured_by_us?: boolean;
  };

export const EmployeeCreatorSchema = z
  .toZod<EmployeeCreatorInput>()(
    z.object({
      person_id: z.uuid().optional(),
      user_id: z.uuid().optional(),
      first_name: z.string().trim().max(255).optional(),
      last_name: z.string().trim().max(255).optional(),
      email: z.email().max(255).nullable().optional(),
      employee_no: z.number().int().min(1).nullable().optional(),
      company_id: z.uuid().optional(),
      company_name: z.string().trim().max(255).nullable().optional(),
      business_type: OrganizationBusinessTypeSchema.nullable().optional(),
      type_of_employment: TypeOfEmploymentSchema,
      title: z.string().trim().max(255).nullable().optional(),
      type: ExperienceTypeSchema.optional(),
      runtime_model: RuntimeModelSchema.nullable().optional(),
      location_type: LocationTypeSchema.nullable().optional(),
      reason: ExperienceReasonSchema.nullable().optional(),
      description: z.string().nullable().optional(),
      start_date: IsoInstantSchema,
      end_date: IsoInstantSchema,
      short_time_work: z.boolean().optional(),
      insured_by_us: z.boolean().optional(),
    }),
  )
  .refine(
    (value) =>
      !!(
        value.person_id ||
        value.user_id ||
        (value.first_name && value.last_name) ||
        value.email
      ),
  )
  .openapi("EmployeeCreator");

export const EmployeeIdParamSchema = IdParamSchema;
export type Employee = z.infer<typeof EmployeeSchema>;
export type EmployeeCreate = z.infer<typeof EmployeeCreateSchema>;
export type EmployeeUpdate = z.infer<typeof EmployeeUpdateSchema>;
export type EmployeeSearchQuery = z.infer<typeof EmployeeSearchQuerySchema>;
export type DesiredEmployeeNoQuery = z.infer<
  typeof DesiredEmployeeNoQuerySchema
>;
export type EmployeeCreator = z.infer<typeof EmployeeCreatorSchema>;
