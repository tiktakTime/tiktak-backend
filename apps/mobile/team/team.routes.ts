import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileTeamPending");

const get_organization_team_id = defineRoute({
  name: "mobile.get.organization.team.id",
  method: "get",
  path: "/organization/team/{id}",
  tag: "mobile.team",
  summary: "GET /organization/team/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_team_search = defineRoute({
  name: "mobile.get.organization.team.search",
  method: "get",
  path: "/organization/team/search",
  tag: "mobile.team",
  summary: "GET /organization/team/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileTeamRouter = createSlice([
  get_organization_team_id,
  get_organization_team_search,
]);
