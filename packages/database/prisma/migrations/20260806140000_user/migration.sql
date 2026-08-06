-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'blocked');

-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('female', 'male', 'none');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "country_id" UUID,
    "nationality_id" UUID,
    "system_role_id" UUID,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
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
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "expired_date" TIMESTAMPTZ(6),
    "notification_key" TEXT,
    "notification_key_web" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "last_password_change_at" TIMESTAMPTZ(6),
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "recovery_email" VARCHAR(255),
    "is_recovery_email_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_user_email_unique" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "idx_user_phone_landline_unique" ON "user"("phone_landline");

-- CreateIndex
CREATE UNIQUE INDEX "idx_user_phone_mobile_unique" ON "user"("phone_mobile");

-- CreateIndex
CREATE UNIQUE INDEX "idx_user_recovery_email_unique" ON "user"("recovery_email");

-- CreateIndex
CREATE INDEX "idx_user_country_id" ON "user"("country_id");

-- CreateIndex
CREATE INDEX "idx_user_nationality_id" ON "user"("nationality_id");

-- CreateIndex
CREATE INDEX "idx_user_status" ON "user"("status");

-- CreateIndex
CREATE INDEX "idx_user_system_role_id" ON "user"("system_role_id");
