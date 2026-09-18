-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('pending', 'active', 'inactive', 'blocked', 'canceled');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('active', 'inactive', 'blocked');

-- CreateEnum
CREATE TYPE "OrganizationBusinessType" AS ENUM ('sole_proprietorship', 'partnership', 'corporation', 'cooperative', 'association', 'civil_law_foundation', 'public_authority', 'public_law_institution', 'public_law_corporation', 'state_municipal_enterprise');

-- CreateEnum
CREATE TYPE "OrganizationLegalForm" AS ENUM ('gmbh', 'ug', 'ag', 'kgaa', 'gmbh_co_kg', 'ug_co_kg', 'ag_co_kg', 'se');

-- CreateEnum
CREATE TYPE "PersonStatus" AS ENUM ('active', 'inactive', 'blocked');

-- CreateEnum
CREATE TYPE "PersonGender" AS ENUM ('female', 'male', 'other', 'none');

-- CreateEnum
CREATE TYPE "PersonPermissionEffect" AS ENUM ('grant', 'deny');

-- CreateTable
CREATE TABLE "access" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "person_id" UUID,
    "role_id" UUID,
    "status" "AccessStatus" NOT NULL DEFAULT 'active',
    "expired_date" TIMESTAMPTZ(6),
    "description" TEXT,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "native_name" VARCHAR(255),
    "official_name" VARCHAR(255),
    "iso" VARCHAR(2) NOT NULL,
    "phone_code" VARCHAR(10),
    "currency_code" VARCHAR(5),
    "currency_symbol" VARCHAR(10),
    "region" VARCHAR(100),
    "subregion" VARCHAR(100),
    "capital" VARCHAR(100),
    "timezones" TEXT[],
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "deleted_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "experience_id" UUID,
    "exit_date" TIMESTAMPTZ(6),
    "employee_no" INTEGER,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "deleted_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "country_id" UUID,
    "unique_id" TEXT,
    "company_name" VARCHAR(255),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "business_type" "OrganizationBusinessType" NOT NULL,
    "legal_form" "OrganizationLegalForm",
    "established_date" DATE,
    "email" VARCHAR(255),
    "phone_landline" VARCHAR(15),
    "phone_mobile" VARCHAR(50),
    "fax" VARCHAR(50),
    "website" VARCHAR(255),
    "company_no" VARCHAR(255),
    "tax_id" VARCHAR(255),
    "vat_id" VARCHAR(255),
    "bin" VARCHAR(255),
    "trade_license_no" VARCHAR(255),
    "commercial_register_no" VARCHAR(255),
    "eori_number" VARCHAR(255),
    "register_court" VARCHAR(255),
    "account_holder" VARCHAR(255),
    "industry_category" VARCHAR(255),
    "image" TEXT,
    "about" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'active',
    "expired_date" TIMESTAMPTZ(6),
    "owner_id" UUID,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID,
    "slug" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "deleted_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "role_id" UUID,
    "employee_id" UUID,
    "country_id" UUID,
    "nationality_id" UUID,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "gender" "PersonGender" NOT NULL DEFAULT 'none',
    "birth_location" VARCHAR(255),
    "birthdate" DATE,
    "image" TEXT,
    "phone_landline" VARCHAR(15),
    "phone_mobile" VARCHAR(50),
    "driver_license_no" VARCHAR(255),
    "driver_license_type" VARCHAR(255),
    "driver_license_organization" VARCHAR(255),
    "insurance_company" VARCHAR(255),
    "insurance_no" VARCHAR(255),
    "insurance_class" VARCHAR(255),
    "tax_no" VARCHAR(255),
    "tax_id" VARCHAR(255),
    "tax_class" VARCHAR(255),
    "child_exempt_amount" VARCHAR(255),
    "health_insurance" VARCHAR(255),
    "social_health_no" VARCHAR(255),
    "status" "PersonStatus" NOT NULL DEFAULT 'inactive',
    "expired_date" TIMESTAMPTZ(6),
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "deleted_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_permission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "effect" "PersonPermissionEffect" NOT NULL DEFAULT 'grant',
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "person_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID,
    "slug" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "deleted_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE INDEX "idx_access_organization_id" ON "access"("organization_id");

-- CreateIndex
CREATE INDEX "idx_access_user_id" ON "access"("user_id");

-- CreateIndex
CREATE INDEX "idx_access_person_id" ON "access"("person_id");

-- CreateIndex
CREATE INDEX "idx_access_status" ON "access"("status");

-- CreateIndex
CREATE INDEX "idx_access_role_id" ON "access"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_country_name_unique" ON "country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "idx_country_iso_unique" ON "country"("iso");

-- CreateIndex
CREATE INDEX "idx_country_region" ON "country"("region");

-- CreateIndex
CREATE INDEX "idx_country_subregion" ON "country"("subregion");

-- CreateIndex
CREATE INDEX "idx_employee_organization_id" ON "employee"("organization_id");

-- CreateIndex
CREATE INDEX "idx_employee_deleted_at" ON "employee"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_employee_person_id" ON "employee"("person_id");

-- CreateIndex
CREATE INDEX "idx_employee_experience_id" ON "employee"("experience_id");

-- CreateIndex
CREATE INDEX "idx_employee_org_exit_date" ON "employee"("organization_id", "exit_date");

-- CreateIndex
CREATE UNIQUE INDEX "idx_employee_organization_person_unique" ON "employee"("organization_id", "person_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_organization_unique_id_unique" ON "organization"("unique_id");

-- CreateIndex
CREATE INDEX "idx_organization_status" ON "organization"("status");

-- CreateIndex
CREATE INDEX "idx_organization_country_id" ON "organization"("country_id");

-- CreateIndex
CREATE INDEX "idx_permission_organization_id" ON "permission"("organization_id");

-- CreateIndex
CREATE INDEX "idx_permission_is_locked" ON "permission"("is_locked");

-- CreateIndex
CREATE UNIQUE INDEX "idx_permission_organization_slug_unique" ON "permission"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "idx_person_organization_id" ON "person"("organization_id");

-- CreateIndex
CREATE INDEX "idx_person_organization_email" ON "person"("organization_id", "email");

-- CreateIndex
CREATE INDEX "idx_person_organization_name" ON "person"("organization_id", "first_name", "last_name");

-- CreateIndex
CREATE INDEX "idx_person_organization_role" ON "person"("organization_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_person_organization_employee_unique" ON "person"("organization_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_person_organization_user_unique" ON "person"("organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_person_organization_email_unique" ON "person"("organization_id", "email");

-- CreateIndex
CREATE INDEX "idx_person_permission_person_id" ON "person_permission"("person_id");

-- CreateIndex
CREATE INDEX "idx_person_permission_permission_id" ON "person_permission"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_person_permission_org_person_permission_unique" ON "person_permission"("organization_id", "person_id", "permission_id");

-- CreateIndex
CREATE INDEX "idx_role_organization_id" ON "role"("organization_id");

-- CreateIndex
CREATE INDEX "idx_role_is_locked" ON "role"("is_locked");

-- CreateIndex
CREATE UNIQUE INDEX "idx_role_organization_slug_unique" ON "role"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "idx_role_permission_organization_id" ON "role_permission"("organization_id");

-- CreateIndex
CREATE INDEX "idx_role_permission_role_id" ON "role_permission"("role_id");

-- CreateIndex
CREATE INDEX "idx_role_permission_permission_id" ON "role_permission"("permission_id");

-- CreateIndex
CREATE INDEX "idx_role_permission_organization_role" ON "role_permission"("organization_id", "role_id");

-- CreateIndex
CREATE INDEX "idx_role_permission_organization_permission" ON "role_permission"("organization_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_role_permission_organization_role_permission_unique" ON "role_permission"("organization_id", "role_id", "permission_id");

-- Partial uniques (humans parity: soft-deleted rows can reuse names / numbers)
CREATE UNIQUE INDEX "idx_organization_company_name_unique" ON "organization"("company_name") WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX "idx_employee_organization_employee_no_unique" ON "employee"("organization_id", "employee_no") WHERE "deleted_at" IS NULL;

