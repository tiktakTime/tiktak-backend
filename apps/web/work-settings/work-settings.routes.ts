import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.workSettingsPending");

const get_organization_work_work_settings_me = defineRoute({
  name: "web.get.organization.work.work-settings.me",
  method: "get",
  path: "/organization/work/work-settings/me",
  tag: "web.work-settings",
  summary: "GET /organization/work/work-settings/me",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_work_work_settings_me = defineRoute({
  name: "web.patch.organization.work.work-settings.me",
  method: "patch",
  path: "/organization/work/work-settings/me",
  tag: "web.work-settings",
  summary: "PATCH /organization/work/work-settings/me",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webWorkSettingsRouter = createSlice([
  get_organization_work_work_settings_me,
  patch_organization_work_work_settings_me,
]);
