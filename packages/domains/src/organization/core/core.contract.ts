import { TTL } from "@tiktak/cache";
import {
  OrgIdParamsSchema,
  SearchSchema,
  SlugParamsSchema,
  org,
  orgId,
  tags,
} from "@tiktak/core";

import { OrganizationListQuerySchema } from "./core.types";

export const list = {
  path: org("/list"),
  method: "get" as const,
  summary: "List organizations",
  tag: tags.organization,
  request: {
    query: OrganizationListQuerySchema,
  },
  prefix: (c: any) => "user:" + c.get("user").id,
  ttl: TTL.DEFAULT,
};

export const getBySlug = {
  path: org("/by-slug/{slug}"),
  method: "get" as const,
  summary: "Get organization by slug",
  tag: tags.organization,
  request: {
    params: SlugParamsSchema,
  },
  ttl: TTL.LONG,
};

export const create = {
  path: org(""),
  method: "post" as const,
  summary: "Create an organization",
  tag: tags.organization,
  prefix: (c: any) => "user:" + c.get("user").id,
  invalidates: [list],
};

export const get = {
  path: orgId(""),
  method: "get" as const,
  summary: "Get organization details",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
  },
  ttl: TTL.LONG,
};

export const update = {
  path: orgId(""),
  method: "patch" as const,
  summary: "Update organization settings",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
  },
  invalidates: [get, getBySlug],
};

export const deletee = {
  path: orgId(""),
  method: "delete" as const,
  summary: "Delete organization",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
  },
  invalidates: [get],
};

export const transferOwnership = {
  path: orgId("/transfer-ownership"),
  method: "post" as const,
  summary: "Transfer organization ownership",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
  },
  invalidates: [get],
};

export const search = {
  path: orgId("/search"),
  method: "get" as const,
  summary: "Global search across database models",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
    query: SearchSchema,
  },
};
