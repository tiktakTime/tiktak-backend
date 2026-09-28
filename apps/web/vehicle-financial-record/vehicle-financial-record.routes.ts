import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Web.vehicleFinancialRecordPending");

const delete_organization_vehicle_vehicle_id_financial_records_record_id =
  defineRoute({
    name: "web.delete.organization.vehicle.vehicle_id.financial-records.record_id",
    method: "delete",
    path: "/organization/vehicle/{vehicle_id}/financial-records/{record_id}",
    tag: "web.vehicle-financial-record",
    summary:
      "DELETE /organization/vehicle/{vehicle_id}/financial-records/{record_id}",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const patch_organization_vehicle_vehicle_id_financial_records_record_id =
  defineRoute({
    name: "web.patch.organization.vehicle.vehicle_id.financial-records.record_id",
    method: "patch",
    path: "/organization/vehicle/{vehicle_id}/financial-records/{record_id}",
    tag: "web.vehicle-financial-record",
    summary:
      "PATCH /organization/vehicle/{vehicle_id}/financial-records/{record_id}",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const get_organization_vehicle_vehicle_id_financial_records_search =
  defineRoute({
    name: "web.get.organization.vehicle.vehicle_id.financial-records.search",
    method: "get",
    path: "/organization/vehicle/{vehicle_id}/financial-records/search",
    tag: "web.vehicle-financial-record",
    summary: "GET /organization/vehicle/{vehicle_id}/financial-records/search",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const get_organization_vehicle_vehicle_id_financial_records_summary =
  defineRoute({
    name: "web.get.organization.vehicle.vehicle_id.financial-records.summary",
    method: "get",
    path: "/organization/vehicle/{vehicle_id}/financial-records/summary",
    tag: "web.vehicle-financial-record",
    summary: "GET /organization/vehicle/{vehicle_id}/financial-records/summary",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

export const webVehicleFinancialRecordRouter = createSlice([
  delete_organization_vehicle_vehicle_id_financial_records_record_id,
  patch_organization_vehicle_vehicle_id_financial_records_record_id,
  get_organization_vehicle_vehicle_id_financial_records_search,
  get_organization_vehicle_vehicle_id_financial_records_summary,
]);
