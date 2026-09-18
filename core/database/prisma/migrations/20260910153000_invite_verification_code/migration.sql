-- CreateEnum
CREATE TYPE "VerificationCodeType" AS ENUM (
  'register',
  'invite',
  'access_confirm',
  'password_reset',
  'email_change',
  'two_factor',
  'phone_verification',
  'account_recovery',
  'login_verification'
);

-- CreateEnum
CREATE TYPE "VerificationCodeStatus" AS ENUM (
  'pending',
  'verified',
  'expired',
  'cancelled'
);

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM (
  'pending',
  'accepted',
  'expired',
  'canceled'
);

-- CreateTable
CREATE TABLE "verification_code" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID,
  "user_id" UUID,
  "type" "VerificationCodeType" NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(50),
  "code" VARCHAR(10),
  "token" VARCHAR(255),
  "status" "VerificationCodeStatus" NOT NULL DEFAULT 'pending',
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "used_at" TIMESTAMPTZ(6),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "max_attempts" INTEGER NOT NULL DEFAULT 5,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_code_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_verification_code_token_unique" ON "verification_code"("token");
CREATE INDEX "idx_verification_code_email" ON "verification_code"("email");
CREATE INDEX "idx_verification_code_phone" ON "verification_code"("phone");
CREATE INDEX "idx_verification_code_code" ON "verification_code"("code");
CREATE INDEX "idx_verification_code_type" ON "verification_code"("type");
CREATE INDEX "idx_verification_code_status" ON "verification_code"("status");
CREATE INDEX "idx_verification_code_organization_id" ON "verification_code"("organization_id");
CREATE INDEX "idx_verification_code_user_id" ON "verification_code"("user_id");
CREATE INDEX "idx_verification_code_expires_at" ON "verification_code"("expires_at");
CREATE INDEX "idx_verification_code_email_type_status" ON "verification_code"("email", "type", "status");

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

CREATE UNIQUE INDEX "idx_invite_token_unique" ON "invite"("token");
CREATE INDEX "idx_invite_organization_id" ON "invite"("organization_id");
CREATE INDEX "idx_invite_user_id" ON "invite"("user_id");
CREATE INDEX "idx_invite_person_id" ON "invite"("person_id");
CREATE INDEX "idx_invite_status" ON "invite"("status");
CREATE INDEX "idx_invite_expires_at" ON "invite"("expires_at");
CREATE INDEX "idx_invite_locked_until" ON "invite"("locked_until");
