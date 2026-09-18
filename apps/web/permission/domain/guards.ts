import { AppError } from "@/core/errors";

export function assertPermissionWritable(
  permission: { is_locked: boolean; organization_id: string | null },
  orgId?: string,
) {
  if (permission.is_locked) {
    throw new AppError("PERMISSION_LOCKED");
  }
  if (orgId !== undefined && permission.organization_id !== orgId) {
    throw new AppError("FORBIDDEN");
  }
}
