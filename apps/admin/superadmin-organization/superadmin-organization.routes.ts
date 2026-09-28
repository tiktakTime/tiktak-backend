import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Admin.superadminOrganizationPending");

const post_superadmin_organization = defineRoute({
  name: "admin.post.superadmin.organization",
  method: "post",
  path: "/superadmin/organization",
  tag: "admin.superadmin-organization",
  summary: "POST /superadmin/organization",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_superadmin_organization_id = defineRoute({
  name: "admin.delete.superadmin.organization.id",
  method: "delete",
  path: "/superadmin/organization/{id}",
  tag: "admin.superadmin-organization",
  summary: "DELETE /superadmin/organization/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_organization_id = defineRoute({
  name: "admin.get.superadmin.organization.id",
  method: "get",
  path: "/superadmin/organization/{id}",
  tag: "admin.superadmin-organization",
  summary: "GET /superadmin/organization/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_superadmin_organization_id = defineRoute({
  name: "admin.patch.superadmin.organization.id",
  method: "patch",
  path: "/superadmin/organization/{id}",
  tag: "admin.superadmin-organization",
  summary: "PATCH /superadmin/organization/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_organization_id_access_search = defineRoute({
  name: "admin.get.superadmin.organization.id.access.search",
  method: "get",
  path: "/superadmin/organization/{id}/access/search",
  tag: "admin.superadmin-organization",
  summary: "GET /superadmin/organization/{id}/access/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_organization_id_company_search = defineRoute({
  name: "admin.get.superadmin.organization.id.company.search",
  method: "get",
  path: "/superadmin/organization/{id}/company/search",
  tag: "admin.superadmin-organization",
  summary: "GET /superadmin/organization/{id}/company/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_organization_id_invite_search = defineRoute({
  name: "admin.get.superadmin.organization.id.invite.search",
  method: "get",
  path: "/superadmin/organization/{id}/invite/search",
  tag: "admin.superadmin-organization",
  summary: "GET /superadmin/organization/{id}/invite/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_organization_id_person_search = defineRoute({
  name: "admin.get.superadmin.organization.id.person.search",
  method: "get",
  path: "/superadmin/organization/{id}/person/search",
  tag: "admin.superadmin-organization",
  summary: "GET /superadmin/organization/{id}/person/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_superadmin_organization_id_restore = defineRoute({
  name: "admin.patch.superadmin.organization.id.restore",
  method: "patch",
  path: "/superadmin/organization/{id}/restore",
  tag: "admin.superadmin-organization",
  summary: "PATCH /superadmin/organization/{id}/restore",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_organization_id_role_search = defineRoute({
  name: "admin.get.superadmin.organization.id.role.search",
  method: "get",
  path: "/superadmin/organization/{id}/role/search",
  tag: "admin.superadmin-organization",
  summary: "GET /superadmin/organization/{id}/role/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_organization_search = defineRoute({
  name: "admin.get.superadmin.organization.search",
  method: "get",
  path: "/superadmin/organization/search",
  tag: "admin.superadmin-organization",
  summary: "GET /superadmin/organization/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const adminSuperadminOrganizationRouter = createSlice([
  post_superadmin_organization,
  delete_superadmin_organization_id,
  get_superadmin_organization_id,
  patch_superadmin_organization_id,
  get_superadmin_organization_id_access_search,
  get_superadmin_organization_id_company_search,
  get_superadmin_organization_id_invite_search,
  get_superadmin_organization_id_person_search,
  patch_superadmin_organization_id_restore,
  get_superadmin_organization_id_role_search,
  get_superadmin_organization_search,
]);
