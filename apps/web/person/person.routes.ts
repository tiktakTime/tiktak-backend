import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.personPending");

const post_organization_person = defineRoute({
  name: "web.post.organization.person",
  method: "post",
  path: "/organization/person",
  tag: "web.person",
  summary: "POST /organization/person",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_person_id = defineRoute({
  name: "web.delete.organization.person.id",
  method: "delete",
  path: "/organization/person/{id}",
  tag: "web.person",
  summary: "DELETE /organization/person/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_person_id = defineRoute({
  name: "web.get.organization.person.id",
  method: "get",
  path: "/organization/person/{id}",
  tag: "web.person",
  summary: "GET /organization/person/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_person_id = defineRoute({
  name: "web.patch.organization.person.id",
  method: "patch",
  path: "/organization/person/{id}",
  tag: "web.person",
  summary: "PATCH /organization/person/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_person_id_role_permission = defineRoute({
  name: "web.get.organization.person.id.role-permission",
  method: "get",
  path: "/organization/person/{id}/role-permission",
  tag: "web.person",
  summary: "GET /organization/person/{id}/role-permission",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_person_id_role_permission = defineRoute({
  name: "web.patch.organization.person.id.role-permission",
  method: "patch",
  path: "/organization/person/{id}/role-permission",
  tag: "web.person",
  summary: "PATCH /organization/person/{id}/role-permission",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_person_compare_with_user = defineRoute({
  name: "web.get.organization.person.compare-with-user",
  method: "get",
  path: "/organization/person/compare-with-user",
  tag: "web.person",
  summary: "GET /organization/person/compare-with-user",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_person_dashboard = defineRoute({
  name: "web.get.organization.person.dashboard",
  method: "get",
  path: "/organization/person/dashboard",
  tag: "web.person",
  summary: "GET /organization/person/dashboard",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_person_match_with_user = defineRoute({
  name: "web.post.organization.person.match-with-user",
  method: "post",
  path: "/organization/person/match-with-user",
  tag: "web.person",
  summary: "POST /organization/person/match-with-user",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_person_search = defineRoute({
  name: "web.get.organization.person.search",
  method: "get",
  path: "/organization/person/search",
  tag: "web.person",
  summary: "GET /organization/person/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_person_search_with_user = defineRoute({
  name: "web.get.organization.person.search-with-user",
  method: "get",
  path: "/organization/person/search-with-user",
  tag: "web.person",
  summary: "GET /organization/person/search-with-user",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webPersonRouter = createSlice([
  post_organization_person,
  delete_organization_person_id,
  get_organization_person_id,
  patch_organization_person_id,
  get_organization_person_id_role_permission,
  patch_organization_person_id_role_permission,
  get_organization_person_compare_with_user,
  get_organization_person_dashboard,
  post_organization_person_match_with_user,
  get_organization_person_search,
  get_organization_person_search_with_user,
]);
