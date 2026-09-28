import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.settlementRoomPending");

const post_organization_settlement_room = defineRoute({
  name: "web.post.organization.settlement.room",
  method: "post",
  path: "/organization/settlement/room",
  tag: "web.settlement-room",
  summary: "POST /organization/settlement/room",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_settlement_room_id = defineRoute({
  name: "web.delete.organization.settlement.room.id",
  method: "delete",
  path: "/organization/settlement/room/{id}",
  tag: "web.settlement-room",
  summary: "DELETE /organization/settlement/room/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_settlement_room_id = defineRoute({
  name: "web.get.organization.settlement.room.id",
  method: "get",
  path: "/organization/settlement/room/{id}",
  tag: "web.settlement-room",
  summary: "GET /organization/settlement/room/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_settlement_room_id = defineRoute({
  name: "web.patch.organization.settlement.room.id",
  method: "patch",
  path: "/organization/settlement/room/{id}",
  tag: "web.settlement-room",
  summary: "PATCH /organization/settlement/room/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_room_id_archive = defineRoute({
  name: "web.post.organization.settlement.room.id.archive",
  method: "post",
  path: "/organization/settlement/room/{id}/archive",
  tag: "web.settlement-room",
  summary: "POST /organization/settlement/room/{id}/archive",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_room_id_employees = defineRoute({
  name: "web.post.organization.settlement.room.id.employees",
  method: "post",
  path: "/organization/settlement/room/{id}/employees",
  tag: "web.settlement-room",
  summary: "POST /organization/settlement/room/{id}/employees",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_room_id_employees_remove = defineRoute({
  name: "web.post.organization.settlement.room.id.employees.remove",
  method: "post",
  path: "/organization/settlement/room/{id}/employees/remove",
  tag: "web.settlement-room",
  summary: "POST /organization/settlement/room/{id}/employees/remove",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_room_id_recalculate = defineRoute({
  name: "web.post.organization.settlement.room.id.recalculate",
  method: "post",
  path: "/organization/settlement/room/{id}/recalculate",
  tag: "web.settlement-room",
  summary: "POST /organization/settlement/room/{id}/recalculate",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_settlement_room_search = defineRoute({
  name: "web.get.organization.settlement.room.search",
  method: "get",
  path: "/organization/settlement/room/search",
  tag: "web.settlement-room",
  summary: "GET /organization/settlement/room/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_settlement_room_id_status = defineRoute({
  name: "web.patch.organization.settlement.room.id.status",
  method: "patch",
  path: "/organization/settlement/room/{id}/status",
  tag: "web.settlement-room",
  summary: "PATCH /organization/settlement/room/{id}/status",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webSettlementRoomRouter = createSlice([
  post_organization_settlement_room,
  delete_organization_settlement_room_id,
  get_organization_settlement_room_id,
  patch_organization_settlement_room_id,
  post_organization_settlement_room_id_archive,
  post_organization_settlement_room_id_employees,
  post_organization_settlement_room_id_employees_remove,
  post_organization_settlement_room_id_recalculate,
  get_organization_settlement_room_search,
  patch_organization_settlement_room_id_status,
]);
