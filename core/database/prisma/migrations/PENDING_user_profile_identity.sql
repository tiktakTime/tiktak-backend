-- REVIEW ONLY — do not apply until approved.
-- Target: lean user (hot) + user_profile (cold) + user_identity + user_device
-- + phone_mobile → phone_number (person, organization)
-- + bool verified → *_verified_at timestamps
-- After review: move into dated migration folder, then `pnpm db:migrate`.

-- 1) Enums
DO $$ BEGIN
  CREATE TYPE "AuthProvider" AS ENUM ('password', 'google', 'apple');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DevicePlatform" AS ENUM ('ios', 'android', 'web');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) New tables
CREATE TABLE IF NOT EXISTS "user_profile" (
  "user_id" UUID NOT NULL,
  "country_id" UUID,
  "nationality_id" UUID,
  "gender" "UserGender" NOT NULL DEFAULT 'none',
  "birth_location" VARCHAR(255),
  "birthdate" DATE,
  "phone_landline" VARCHAR(15),
  "phone_number" VARCHAR(50),
  "phone_verified_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_profile_pkey" PRIMARY KEY ("user_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_profile_phone_number_unique"
  ON "user_profile"("phone_number");
CREATE INDEX IF NOT EXISTS "idx_user_profile_country_id" ON "user_profile"("country_id");
CREATE INDEX IF NOT EXISTS "idx_user_profile_nationality_id" ON "user_profile"("nationality_id");

CREATE TABLE IF NOT EXISTS "user_identity" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "provider" "AuthProvider" NOT NULL,
  "provider_subject" VARCHAR(255) NOT NULL,
  "provider_email" VARCHAR(255),
  "password_hash" VARCHAR(255),
  "password_changed_at" TIMESTAMPTZ(6),
  "linked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_used_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_identity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_identity_provider_subject_unique"
  ON "user_identity"("provider", "provider_subject");
CREATE INDEX IF NOT EXISTS "idx_user_identity_user_id" ON "user_identity"("user_id");

CREATE TABLE IF NOT EXISTS "user_device" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "platform" "DevicePlatform" NOT NULL,
  "push_token" VARCHAR(512),
  "device_id" VARCHAR(255),
  "app_version" VARCHAR(50),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_device_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_device_push_token_unique"
  ON "user_device"("push_token");
CREATE INDEX IF NOT EXISTS "idx_user_device_user_id" ON "user_device"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_device_user_active"
  ON "user_device"("user_id", "is_active");

-- 3) Backfill profile (cold fields only)
INSERT INTO "user_profile" (
  "user_id", "country_id", "nationality_id", "gender",
  "birth_location", "birthdate",
  "phone_landline", "phone_number", "phone_verified_at",
  "created_at", "updated_at"
)
SELECT
  u."id", u."country_id", u."nationality_id", u."gender",
  u."birth_location", u."birthdate",
  u."phone_landline", u."phone_mobile",
  CASE WHEN u."is_phone_verified" THEN u."updated_at" ELSE NULL END,
  u."created_at", u."updated_at"
FROM "user" u
ON CONFLICT ("user_id") DO NOTHING;

-- 4) Backfill password identities
INSERT INTO "user_identity" (
  "user_id", "provider", "provider_subject", "provider_email",
  "password_hash", "password_changed_at", "linked_at"
)
SELECT
  u."id",
  'password'::"AuthProvider",
  'local',
  u."email",
  u."password",
  u."last_password_change_at",
  u."created_at"
FROM "user" u
WHERE u."password" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "user_identity" i
    WHERE i."user_id" = u."id" AND i."provider" = 'password'
  );

-- 5) Backfill devices from legacy notification keys
INSERT INTO "user_device" ("user_id", "platform", "push_token", "is_active")
SELECT u."id", 'android'::"DevicePlatform", u."notification_key", TRUE
FROM "user" u
WHERE u."notification_key" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "user_device" d WHERE d."push_token" = u."notification_key"
  );

INSERT INTO "user_device" ("user_id", "platform", "push_token", "is_active")
SELECT u."id", 'web'::"DevicePlatform", u."notification_key_web", TRUE
FROM "user" u
WHERE u."notification_key_web" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "user_device" d WHERE d."push_token" = u."notification_key_web"
  );

-- 6) Add new hot columns on user (keep old until backfill)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "display_name" VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "picture" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "locale" VARCHAR(35);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(64);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMPTZ(6);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMPTZ(6);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "recovery_email_verified_at" TIMESTAMPTZ(6);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "two_factor_enabled_at" TIMESTAMPTZ(6);

UPDATE "user" SET
  "picture" = COALESCE("picture", "image"),
  "expires_at" = COALESCE("expires_at", "expired_date"),
  "email_verified_at" = COALESCE(
    "email_verified_at",
    CASE WHEN "is_email_verified" THEN "updated_at" ELSE NULL END
  ),
  "recovery_email_verified_at" = COALESCE(
    "recovery_email_verified_at",
    CASE WHEN "is_recovery_email_verified" THEN "updated_at" ELSE NULL END
  ),
  "two_factor_enabled_at" = COALESCE(
    "two_factor_enabled_at",
    CASE WHEN "is_two_factor_enabled" THEN "updated_at" ELSE NULL END
  );

-- first_name / last_name already on user — keep, default empty if needed
ALTER TABLE "user" ALTER COLUMN "first_name" SET DEFAULT '';
ALTER TABLE "user" ALTER COLUMN "last_name" SET DEFAULT '';

-- 7) Relax email nullability (OAuth-only)
ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL;

-- 8) Drop obsolete columns from user
ALTER TABLE "user" DROP COLUMN IF EXISTS "password";
ALTER TABLE "user" DROP COLUMN IF EXISTS "gender";
ALTER TABLE "user" DROP COLUMN IF EXISTS "birth_location";
ALTER TABLE "user" DROP COLUMN IF EXISTS "birthdate";
ALTER TABLE "user" DROP COLUMN IF EXISTS "image";
ALTER TABLE "user" DROP COLUMN IF EXISTS "phone_landline";
ALTER TABLE "user" DROP COLUMN IF EXISTS "phone_mobile";
ALTER TABLE "user" DROP COLUMN IF EXISTS "driver_license_no";
ALTER TABLE "user" DROP COLUMN IF EXISTS "driver_license_type";
ALTER TABLE "user" DROP COLUMN IF EXISTS "driver_license_organization";
ALTER TABLE "user" DROP COLUMN IF EXISTS "insurance_company";
ALTER TABLE "user" DROP COLUMN IF EXISTS "insurance_no";
ALTER TABLE "user" DROP COLUMN IF EXISTS "insurance_class";
ALTER TABLE "user" DROP COLUMN IF EXISTS "tax_no";
ALTER TABLE "user" DROP COLUMN IF EXISTS "tax_id";
ALTER TABLE "user" DROP COLUMN IF EXISTS "tax_class";
ALTER TABLE "user" DROP COLUMN IF EXISTS "child_exempt_amount";
ALTER TABLE "user" DROP COLUMN IF EXISTS "health_insurance";
ALTER TABLE "user" DROP COLUMN IF EXISTS "social_health_no";
ALTER TABLE "user" DROP COLUMN IF EXISTS "notification_key";
ALTER TABLE "user" DROP COLUMN IF EXISTS "notification_key_web";
ALTER TABLE "user" DROP COLUMN IF EXISTS "country_id";
ALTER TABLE "user" DROP COLUMN IF EXISTS "nationality_id";
ALTER TABLE "user" DROP COLUMN IF EXISTS "expired_date";
ALTER TABLE "user" DROP COLUMN IF EXISTS "last_password_change_at";
ALTER TABLE "user" DROP COLUMN IF EXISTS "is_email_verified";
ALTER TABLE "user" DROP COLUMN IF EXISTS "is_phone_verified";
ALTER TABLE "user" DROP COLUMN IF EXISTS "is_recovery_email_verified";
ALTER TABLE "user" DROP COLUMN IF EXISTS "is_two_factor_enabled";

DROP INDEX IF EXISTS "idx_user_country_id";
DROP INDEX IF EXISTS "idx_user_nationality_id";
DROP INDEX IF EXISTS "idx_user_phone_landline_unique";
DROP INDEX IF EXISTS "idx_user_phone_mobile_unique";

-- 9) person / organization: phone_mobile → phone_number; person image → picture + display_name
ALTER TABLE "person" RENAME COLUMN "phone_mobile" TO "phone_number";
ALTER TABLE "organization" RENAME COLUMN "phone_mobile" TO "phone_number";
ALTER TABLE "person" RENAME COLUMN "image" TO "picture";
ALTER TABLE "person" ADD COLUMN IF NOT EXISTS "display_name" VARCHAR(255);
