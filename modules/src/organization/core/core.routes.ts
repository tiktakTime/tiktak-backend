import { clearAllMembershipCache } from "@tiktak/middlewares";
import {
  AppError,
  DeleteResponseSchema,
  UNAUTHORIZED_MESSAGE,
  commonResponses,
  createEndpoint,
  createStandardRoute,
} from "@tiktak/core";

import { CacheInvalidator } from "../../invalidator/invalidator.repo";
import { OrganizationRepository } from "./core.repo";
import * as coreContracts from "./core.contract";
import {
  CreateOrganizationSchema,
  OrganizationResponseSchema,
  TransferOwnershipSchema,
  UpdateOrganizationSchema,
} from "./core.types";

export function createOrganizationCoreRoutes(
  repos: {
    organization: OrganizationRepository;
    membership: { findAllByOrganizationId: (orgId: string) => Promise<Array<{ userId: string }>> };
  },
  invalidator: (c: any) => CacheInvalidator,
) {
  
  const createRoute = createEndpoint(
    createStandardRoute({
      ...coreContracts.create,
      jsonBody: {
        schema: CreateOrganizationSchema.omit({ ownerUserId: true }),
        description: "The organization to create",
      },
      responses: {
        ...commonResponses.created(
          OrganizationResponseSchema,
          "The created organization",
        ),
      },
      commonErrors: ["forbidden", "conflict", "badRequest"],
    }),
    async (c) => {
      const user = c.get("user");
      const { name, slug } = c.req.valid("json");

      if (slug === "auth") {
        return c.json({ message: UNAUTHORIZED_MESSAGE }, 403);
      }

      const organization = await repos.organization.create({
        name,
        slug,
        ownerUserId: user.id,
      });

      if (!organization) {
        return c.json({ message: "error.failed_to_create_org" }, 400);
      }

      clearAllMembershipCache(user.id);

      return c.json(organization, 201);
    },
  );

  const getRoute = createEndpoint(
    createStandardRoute({
      ...coreContracts.get,
      responses: {
        ...commonResponses.ok(
          OrganizationResponseSchema,
          "The organization details",
        ),
        ...commonResponses.notFound("Organization not found"),
      },
    }),
    async (c) => {
      const { orgId } = c.req.valid("param");
      const data = await repos.organization.findById(orgId);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      return c.json(data, 200);
    },
  );

  const getBySlugRoute = createEndpoint(
    createStandardRoute({
      ...coreContracts.getBySlug,
      responses: {
        ...commonResponses.ok(
          OrganizationResponseSchema,
          "The organization details",
        ),
        ...commonResponses.notFound("Organization not found"),
      },
      commonErrors: ["internalServerError", "unauthorized"],
    }),
    async (c) => {
      const user = c.get("user");
      const { slug } = c.req.valid("param");

      const org = await repos.organization.findBySlug(slug, user.id);

      if (!org) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      return c.json(org, 200);
    },
  );

  const updateRoute = createEndpoint(
    createStandardRoute({
      ...coreContracts.update,
      jsonBody: {
        schema: UpdateOrganizationSchema,
        description: "Organization settings to update",
      },
      responses: {
        ...commonResponses.ok(
          OrganizationResponseSchema,
          "The updated organization settings",
        ),
        ...commonResponses.notFound("Organization not found"),
      },
    }),
    async (c) => {
      const { orgId } = c.req.valid("param");
      const json = c.req.valid("json");

      const data = await repos.organization.update(orgId, json);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      const members = await repos.membership.findAllByOrganizationId(orgId);
      invalidator(c).organizationListForUsers(members.map((m) => m.userId));

      return c.json(data, 200);
    },
  );

  const deleteRoute = createEndpoint(
    createStandardRoute({
      ...coreContracts.deletee,
      responses: {
        ...commonResponses.ok(
          DeleteResponseSchema,
          "Organization deleted successfully",
        ),
        ...commonResponses.notFound("Organization not found"),
      },
    }),
    async (c) => {
      const { orgId } = c.req.valid("param");

      const members = await repos.membership.findAllByOrganizationId(orgId);
      const data = await repos.organization.delete(orgId);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      invalidator(c).organizationListForUsers(members.map((m) => m.userId));

      return c.json({ id: orgId, status: "deleted" } as const, 200);
    },
  );

  const transferOwnershipRoute = createEndpoint(
    createStandardRoute({
      ...coreContracts.transferOwnership,
      jsonBody: {
        schema: TransferOwnershipSchema,
        description: "The new owner user ID",
      },
      responses: {
        ...commonResponses.ok(
          OrganizationResponseSchema,
          "Organization ownership transferred",
        ),
        ...commonResponses.notFound("Organization not found"),
      },
    }),
    async (c) => {
      const { orgId } = c.req.valid("param");
      const { newOwnerUserId } = c.req.valid("json");

      const data = await repos.organization.transferOwnership(
        orgId,
        newOwnerUserId,
      );

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      const members = await repos.membership.findAllByOrganizationId(orgId);
      invalidator(c).organizationListForUsers(members.map((m) => m.userId));

      return c.json(data, 200);
    },
  );

  return {
    createRoute,
    getRoute,
    getBySlugRoute,
    updateRoute,
    deleteRoute,
    transferOwnershipRoute,
  };
}
