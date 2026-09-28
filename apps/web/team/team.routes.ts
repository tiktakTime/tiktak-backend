import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.teamPending");

const post_organization_team = defineRoute({
  name: "web.post.organization.team",
  method: "post",
  path: "/organization/team",
  tag: "web.team",
  summary: "POST /organization/team",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_team_id = defineRoute({
  name: "web.delete.organization.team.id",
  method: "delete",
  path: "/organization/team/{id}",
  tag: "web.team",
  summary: "DELETE /organization/team/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_team_id = defineRoute({
  name: "web.get.organization.team.id",
  method: "get",
  path: "/organization/team/{id}",
  tag: "web.team",
  summary: "GET /organization/team/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_team_id = defineRoute({
  name: "web.patch.organization.team.id",
  method: "patch",
  path: "/organization/team/{id}",
  tag: "web.team",
  summary: "PATCH /organization/team/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_team_id_history_search = defineRoute({
  name: "web.get.organization.team.id.history.search",
  method: "get",
  path: "/organization/team/{id}/history/search",
  tag: "web.team",
  summary: "GET /organization/team/{id}/history/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_team_leader_search = defineRoute({
  name: "web.get.organization.team.leader.search",
  method: "get",
  path: "/organization/team/leader/search",
  tag: "web.team",
  summary: "GET /organization/team/leader/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_team_search = defineRoute({
  name: "web.get.organization.team.search",
  method: "get",
  path: "/organization/team/search",
  tag: "web.team",
  summary: "GET /organization/team/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_team_search_grouped = defineRoute({
  name: "web.get.organization.team.search.grouped",
  method: "get",
  path: "/organization/team/search/grouped",
  tag: "web.team",
  summary: "GET /organization/team/search/grouped",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webTeamRouter = createSlice([
  post_organization_team,
  delete_organization_team_id,
  get_organization_team_id,
  patch_organization_team_id,
  get_organization_team_id_history_search,
  get_organization_team_leader_search,
  get_organization_team_search,
  get_organization_team_search_grouped,
]);
