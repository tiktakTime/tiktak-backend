-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'accepted', 'expired', 'canceled');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('active', 'inactive', 'blocked');

-- CreateEnum
CREATE TYPE "OrganizationBusinessType" AS ENUM ('sole_proprietorship', 'corporation');

-- CreateEnum
CREATE TYPE "OrganizationLegalForm" AS ENUM ('gmbh', 'ug', 'ag', 'kgaa', 'gmbh_co_kg', 'ug_co_kg', 'ag_co_kg', 'se');

-- CreateEnum
CREATE TYPE "SocialMediaPlatform" AS ENUM ('instagram', 'facebook', 'linkedin', 'tiktok', 'twitter', 'youtube', 'website');

-- CreateTable
CREATE TABLE "address" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID,
    "reference_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "st_num" VARCHAR(50),
    "st_name" VARCHAR(255) NOT NULL,
    "neighbh" VARCHAR(255),
    "city" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255),
    "zip" VARCHAR(20),
    "cnt_name" VARCHAR(255),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "address_description" TEXT,
    "place_id" VARCHAR(255),
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID,
    "reference_id" UUID NOT NULL,
    "owner_name" VARCHAR(255) NOT NULL,
    "is_owner" BOOLEAN NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "bank_name" VARCHAR(255) NOT NULL,
    "bank_country" VARCHAR(2),
    "currency" VARCHAR(3),
    "iban" VARCHAR(34),
    "swift_code" VARCHAR(11),
    "account_number" VARCHAR(50),
    "routing_number" VARCHAR(20),
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "invite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "person_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(128) NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "canceled_at" TIMESTAMPTZ(6),
    "accept_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMPTZ(6),
    "locked_until" TIMESTAMPTZ(6),
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "deleted_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "country_id" UUID,
    "reference_id" UUID,
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
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "deleted_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
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
    "gender" "UserGender" NOT NULL DEFAULT 'none',
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
    "status" "OrganizationStatus" NOT NULL DEFAULT 'inactive',
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
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "organization_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "country_id" UUID,
    "unique_id" VARCHAR(255),
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

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID,
    "reference_id" UUID NOT NULL,
    "platform" "SocialMediaPlatform" NOT NULL,
    "url" VARCHAR(500),
    "username" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "social_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_address_organization_id" ON "address"("organization_id");

-- CreateIndex
CREATE INDEX "idx_address_reference_id" ON "address"("reference_id");

-- CreateIndex
CREATE INDEX "idx_address_city" ON "address"("city");

-- CreateIndex
CREATE INDEX "idx_address_country" ON "address"("cnt_name");

-- CreateIndex
CREATE INDEX "idx_address_place_id" ON "address"("place_id");

-- CreateIndex
CREATE INDEX "idx_bank_account_organization_id" ON "bank_account"("organization_id");

-- CreateIndex
CREATE INDEX "idx_bank_account_reference_id" ON "bank_account"("reference_id");

-- CreateIndex
CREATE INDEX "idx_bank_account_iban" ON "bank_account"("iban");

-- CreateIndex
CREATE INDEX "idx_bank_account_account_number" ON "bank_account"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "idx_country_name_unique" ON "country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "idx_country_iso_unique" ON "country"("iso");

-- CreateIndex
CREATE INDEX "idx_country_region" ON "country"("region");

-- CreateIndex
CREATE INDEX "idx_country_subregion" ON "country"("subregion");

-- CreateIndex
CREATE UNIQUE INDEX "idx_invite_token_unique" ON "invite"("token");

-- CreateIndex
CREATE INDEX "idx_invite_organization_id" ON "invite"("organization_id");

-- CreateIndex
CREATE INDEX "idx_invite_user_id" ON "invite"("user_id");

-- CreateIndex
CREATE INDEX "idx_invite_person_id" ON "invite"("person_id");

-- CreateIndex
CREATE INDEX "idx_invite_status" ON "invite"("status");

-- CreateIndex
CREATE INDEX "idx_invite_expires_at" ON "invite"("expires_at");

-- CreateIndex
CREATE INDEX "idx_invite_locked_until" ON "invite"("locked_until");

-- CreateIndex
CREATE INDEX "idx_company_organization_id" ON "company"("organization_id");

-- CreateIndex
CREATE INDEX "idx_company_status" ON "company"("status");

-- CreateIndex
CREATE INDEX "idx_company_country_id" ON "company"("country_id");

-- CreateIndex
CREATE INDEX "idx_company_reference_id" ON "company"("reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_company_organization_name_unique" ON "company"("organization_id", "company_name");

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

-- CreateIndex
CREATE UNIQUE INDEX "idx_organization_unique_id_unique" ON "organization"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_organization_company_name_unique" ON "organization"("company_name");

-- CreateIndex
CREATE INDEX "idx_organization_id" ON "organization"("id");

-- CreateIndex
CREATE INDEX "idx_organization_status" ON "organization"("status");

-- CreateIndex
CREATE INDEX "idx_organization_country_id" ON "organization"("country_id");

-- CreateIndex
CREATE INDEX "idx_social_media_organization_id" ON "social_media"("organization_id");

-- CreateIndex
CREATE INDEX "idx_social_media_reference_id" ON "social_media"("reference_id");

-- CreateIndex
CREATE INDEX "idx_social_media_platform" ON "social_media"("platform");

-- CreateIndex
CREATE INDEX "idx_social_media_reference_platform" ON "social_media"("reference_id", "platform");

-- Partial unique: one default address / bank_account per reference (soft-delete aware)
CREATE UNIQUE INDEX "idx_address_reference_default_unique" ON "address"("reference_id") WHERE (is_default = true AND deleted_at IS NULL);
CREATE UNIQUE INDEX "idx_bank_account_reference_default_unique" ON "bank_account"("reference_id") WHERE (is_default = true AND deleted_at IS NULL);
