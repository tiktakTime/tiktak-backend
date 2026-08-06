-- CreateEnum
CREATE TYPE "PersonPermissionEffect" AS ENUM ('grant', 'deny');

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

-- CreateIndex
CREATE UNIQUE INDEX "idx_person_permission_org_person_permission_unique" ON "person_permission"("organization_id", "person_id", "permission_id");

-- CreateIndex
CREATE INDEX "idx_person_permission_person_id" ON "person_permission"("person_id");

-- CreateIndex
CREATE INDEX "idx_person_permission_permission_id" ON "person_permission"("permission_id");

-- CreateIndex
CREATE INDEX "idx_person_permission_person_effect" ON "person_permission"("organization_id", "person_id", "effect");
