import { z } from "zod";

import {
  AppError,
  DeleteResponseSchema,
  commonResponses,
  createEndpoint,
  createStandardRoute,
} from "@tiktak/core";
import { OrganizationMembershipSchema } from "@tiktak/database";

import { CacheInvalidator } from "../../invalidator/invalidator.repo";
import { MembershipRepository } from "./members.repo";
import * as membersContracts from "./members.contract";
import {
  MembershipResponseSchema,
  UpdateMembershipSchema,
} from "./members.types";

export function createOrganizationMembersRoutes(
  repos: { membership: MembershipRepository },
  invalidator: (c: any) => CacheInvalidator,
) {
  const listRoute = createEndpoint(
    createStandardRoute({
      ...membersContracts.membersList,
      responses: {
        ...commonResponses.ok(
          z.array(MembershipResponseSchema),
          "List of organization members",
        ),
      },
    }),
    async (c) => {
      const { orgId } = c.req.valid("param");
      const data = await repos.membership.findAllByOrganizationId(orgId);

      return c.json(data, 200);
    },
  );

  const updateRoute = createEndpoint(
    createStandardRoute({
      ...membersContracts.membersUpdate,
      jsonBody: {
        schema: UpdateMembershipSchema,
        description: "Member details to update",
      },
      responses: {
        ...commonResponses.ok(
          OrganizationMembershipSchema,
          "Member role updated successfully",
        ),
        ...commonResponses.notFound("Member not found"),
      },
    }),
    async (c) => {
      const { orgId, membershipId } = c.req.valid("param");
      const json = c.req.valid("json");

      const membership = await repos.membership.findById(orgId, membershipId);
      const data = await repos.membership.update(orgId, membershipId, json);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      if (membership) {
        invalidator(c).organizationList(membership.userId);
      }

      return c.json(data, 200);
    },
  );

  const deleteRoute = createEndpoint(
    createStandardRoute({
      ...membersContracts.membersDeletee,
      responses: {
        ...commonResponses.ok(
          DeleteResponseSchema,
          "Member removed successfully",
        ),
        ...commonResponses.notFound("Member not found"),
      },
    }),
    async (c) => {
      const { orgId, membershipId } = c.req.valid("param");

      const membership = await repos.membership.findById(orgId, membershipId);
      const data = await repos.membership.delete(orgId, membershipId);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      if (membership) {
        invalidator(c).organizationList(membership.userId);
      }

      return c.json({ id: membershipId, status: "deleted" } as const, 200);
    },
  );

  return { listRoute, updateRoute, deleteRoute };
}
