import * as rolePermissionRepo from "@/modules/role_permission/role_permission.repo";

export interface ResolvePermissionsInput {
  organizationId: string;
  roleId?: string | null;
  personId?: string | null;
}

/**
 * Role permission slug’larını yükle.
 * Person override (`person_permission`) henüz bu fonksiyona bağlanmadı.
 */
export async function resolvePermissionSlugs(
  input: ResolvePermissionsInput,
): Promise<string[]> {
  const { organizationId, roleId } = input;
  if (!roleId) return [];

  return rolePermissionRepo.listPermissionSlugsForRole({
    organizationId,
    roleId,
  });
}
