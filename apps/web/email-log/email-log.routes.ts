import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.emailLogPending");

const post_organization_email_log_id_retry = defineRoute({
  name: "web.post.organization.email-log.id.retry",
  method: "post",
  path: "/organization/email-log/{id}/retry",
  tag: "web.email-log",
  summary: "POST /organization/email-log/{id}/retry",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_email_log_search = defineRoute({
  name: "web.get.organization.email-log.search",
  method: "get",
  path: "/organization/email-log/search",
  tag: "web.email-log",
  summary: "GET /organization/email-log/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webEmailLogRouter = createSlice([
  post_organization_email_log_id_retry,
  get_organization_email_log_search,
]);
