import { z } from "zod";

import {
  AppError,
  DeleteResponseSchema,
  commonResponses,
  createEndpoint,
  createStandardRoute,
} from "@tiktak/core";
import { OrganizationInvitationSchema } from "@tiktak/database";

import { InvitationRepository } from "./invitations.repo";
import * as invitationsContracts from "./invitations.contract";
import {
  CreateInvitationSchema,
  InvitationResponseSchema,
} from "./invitations.types";

export function createOrganizationInvitationsRoutes(repos: {
  invitation: InvitationRepository;
}) {
  const listRoute = createEndpoint(
    createStandardRoute({
      ...invitationsContracts.invitationsList,
      responses: {
        ...commonResponses.ok(
          z.array(InvitationResponseSchema),
          "List of pending invitations",
        ),
      },
    }),
    async (c) => {
      const { orgId } = c.req.valid("param");
      const data = await repos.invitation.findAllByOrganizationId(orgId);

      return c.json(data, 200);
    },
  );

  const createRoute = createEndpoint(
    createStandardRoute({
      ...invitationsContracts.invitationsCreate,
      jsonBody: {
        schema: CreateInvitationSchema,
        description: "Invitation details",
      },
      responses: {
        ...commonResponses.created(
          OrganizationInvitationSchema,
          "Invitation sent successfully",
        ),
      },
    }),
    async (c) => {
      const { orgId } = c.req.valid("param");
      const json = c.req.valid("json");
      const user = c.get("user");
      if (!user) throw new AppError("FORBIDDEN");

      const data = await repos.invitation.create(orgId, user.id, json);

      return c.json(data, 201);
    },
  );

  const updateRoute = createEndpoint(
    createStandardRoute({
      ...invitationsContracts.invitationsUpdate,
      responses: {
        ...commonResponses.ok(
          z.object({ success: z.boolean() }),
          "Invitation resent successfully",
        ),
        ...commonResponses.notFound("Invitation not found"),
      },
    }),
    async (c) => {
      const { orgId, invitationId } = c.req.valid("param");

      const data = await repos.invitation.findById(orgId, invitationId);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      console.log(`Resending invitation ${invitationId} to ${data.email}`);

      return c.json({ success: true }, 200);
    },
  );

  const deleteRoute = createEndpoint(
    createStandardRoute({
      ...invitationsContracts.invitationsDeletee,
      responses: {
        ...commonResponses.ok(
          DeleteResponseSchema,
          "Invitation revoked successfully",
        ),
        ...commonResponses.notFound("Invitation not found"),
      },
    }),
    async (c) => {
      const { orgId, invitationId } = c.req.valid("param");

      const data = await repos.invitation.delete(orgId, invitationId);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      return c.json({ id: invitationId, status: "deleted" } as const, 200);
    },
  );

  return { listRoute, createRoute, updateRoute, deleteRoute };
}
