import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobilePersonPending");

const get_organization_person_search = defineRoute({
  name: "mobile.get.organization.person.search",
  method: "get",
  path: "/organization/person/search",
  tag: "mobile.person",
  summary: "GET /organization/person/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobilePersonRouter = createSlice([get_organization_person_search]);
