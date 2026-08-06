import { z } from "zod";

import { TTL } from "@tiktak/cache";
import { OrgIdParamsSchema, orgId, tags } from "@tiktak/core";

const RoleIdParamsSchema = OrgIdParamsSchema.extend({
  roleId: z.string(),
});

export const rolesList = {
  path: orgId("/roles"),
  method: "get" as const,
  summary: "List roles",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
  },
  ttl: TTL.DEFAULT,
};

export const rolesCreate = {
  path: orgId("/roles"),
  method: "post" as const,
  summary: "Create role",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
  },
  invalidates: [rolesList],
};

export const rolesGet = {
  path: orgId("/roles/{roleId}"),
  method: "get" as const,
  summary: "Get role details",
  tag: tags.organization,
  request: {
    params: RoleIdParamsSchema,
  },
  ttl: TTL.LONG,
};

export const rolesUpdate = {
  path: orgId("/roles/{roleId}"),
  method: "patch" as const,
  summary: "Update role",
  tag: tags.organization,
  request: {
    params: RoleIdParamsSchema,
  },
  invalidates: [rolesList, rolesGet],
};

export const rolesDeletee = {
  path: orgId("/roles/{roleId}"),
  method: "delete" as const,
  summary: "Delete role",
  tag: tags.organization,
  request: {
    params: RoleIdParamsSchema,
  },
  invalidates: [rolesList, rolesGet],
};

export const roles = {
  list: rolesList,
  create: rolesCreate,
  get: rolesGet,
  update: rolesUpdate,
  deletee: rolesDeletee,
};
