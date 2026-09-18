import { AppError } from "@/core/errors";

export function assertRoleWritable(
  role: { is_locked: boolean; organization_id: string | null },
  orgId?: string,
) {
  if (role.is_locked) {
    throw new AppError("ROLE_LOCKED");
  }
  if (orgId !== undefined && role.organization_id !== orgId) {
    throw new AppError("FORBIDDEN");
  }
}
