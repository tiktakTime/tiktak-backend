import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileModulePending");

const get_organization_form_module_id = defineRoute({
  name: "mobile.get.organization.form.module.id",
  method: "get",
  path: "/organization/form/module/{id}",
  tag: "mobile.module",
  summary: "GET /organization/form/module/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileModuleRouter = createSlice([
  get_organization_form_module_id,
]);
