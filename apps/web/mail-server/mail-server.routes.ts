import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.mailServerPending");

const post_organization_mail_server = defineRoute({
  name: "web.post.organization.mail-server",
  method: "post",
  path: "/organization/mail-server",
  tag: "web.mail-server",
  summary: "POST /organization/mail-server",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_mail_server_id = defineRoute({
  name: "web.delete.organization.mail-server.id",
  method: "delete",
  path: "/organization/mail-server/{id}",
  tag: "web.mail-server",
  summary: "DELETE /organization/mail-server/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_mail_server_id = defineRoute({
  name: "web.get.organization.mail-server.id",
  method: "get",
  path: "/organization/mail-server/{id}",
  tag: "web.mail-server",
  summary: "GET /organization/mail-server/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_mail_server_id = defineRoute({
  name: "web.patch.organization.mail-server.id",
  method: "patch",
  path: "/organization/mail-server/{id}",
  tag: "web.mail-server",
  summary: "PATCH /organization/mail-server/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_mail_server_id_test = defineRoute({
  name: "web.post.organization.mail-server.id.test",
  method: "post",
  path: "/organization/mail-server/{id}/test",
  tag: "web.mail-server",
  summary: "POST /organization/mail-server/{id}/test",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_mail_server_search = defineRoute({
  name: "web.get.organization.mail-server.search",
  method: "get",
  path: "/organization/mail-server/search",
  tag: "web.mail-server",
  summary: "GET /organization/mail-server/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_mail_server_test = defineRoute({
  name: "web.post.organization.mail-server.test",
  method: "post",
  path: "/organization/mail-server/test",
  tag: "web.mail-server",
  summary: "POST /organization/mail-server/test",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webMailServerRouter = createSlice([
  post_organization_mail_server,
  delete_organization_mail_server_id,
  get_organization_mail_server_id,
  patch_organization_mail_server_id,
  post_organization_mail_server_id_test,
  get_organization_mail_server_search,
  post_organization_mail_server_test,
]);
