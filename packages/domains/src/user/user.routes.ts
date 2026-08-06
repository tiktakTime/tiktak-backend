import { z } from "zod";

import {
  AppError,
  commonResponses,
  createEndpoint,
  createPaginatedResponseSchema,
  createStandardRoute,
} from "@tiktak/core";
import {
  MembershipRoleSchema,
  OrganizationInvitationSchema,
  OrganizationSchema,
  UserSchema,
} from "@tiktak/database";

import { CacheInvalidator } from "../invalidator/invalidator.repo";
import { OrganizationRepository } from "../organization/core/core.repo";
import { UserRepository } from "./user.repo";
import * as userContracts from "./user.contract";
import { CreateUserSchema, UpdateUserSchema } from "./user.types";

const InvitationItemSchema = OrganizationInvitationSchema.pick({
  id: true,
  roleId: true,
  createdAt: true,
}).extend({
  organization: OrganizationSchema.pick({
    name: true,
    slug: true,
  }).nullable(),
  role: MembershipRoleSchema.pick({
    name: true,
  }).nullable(),
});

const InvitationResponseSchema =
  createPaginatedResponseSchema(InvitationItemSchema);

export function createUserRoutes(
  repos: {
    user: UserRepository;
    organization: OrganizationRepository;
  },
  invalidator: (c: any) => CacheInvalidator,
) {
  const getRoute = createEndpoint(
    createStandardRoute({
      ...userContracts.get,
      responses: {
        ...commonResponses.ok(UserSchema, "The user profile"),
      },
      commonErrors: ["internalServerError", "forbidden", "notFound"],
    }),
    async (c) => {
      const user = c.get("user");

      let userProfile = await repos.user.findById(user.id);

      if (!userProfile) {
        const createData = CreateUserSchema.parse({
          id: user.id,
          email: user.email || "",
          name: user.name || "",
          avatar: user.avatar,
          isVerified: user.isVerified,
        });

        userProfile = await repos.user.create(createData);

        if (!userProfile) {
          throw new AppError("USER_NOT_FOUND");
        }
      }

      return c.json(userProfile, 200);
    },
  );

  const updateRoute = createEndpoint(
    createStandardRoute({
      ...userContracts.update,
      jsonBody: {
        schema: UpdateUserSchema,
        description: "User profile data to update",
      },
      responses: {
        ...commonResponses.ok(UserSchema, "The updated user profile"),
      },
      commonErrors: ["internalServerError", "forbidden", "notFound"],
    }),
    async (c) => {
      const user = c.get("user");
      const data = c.req.valid("json");

      const updatedUser = await repos.user.update(user.id, data);

      if (!updatedUser) {
        throw new AppError("USER_NOT_FOUND");
      }

      return c.json(updatedUser, 200);
    },
  );

  const invitationsRoute = createEndpoint(
    createStandardRoute({
      ...userContracts.invitations,
      responses: {
        ...commonResponses.ok(
          InvitationResponseSchema,
          "List of pending invitations",
        ),
      },
    }),
    async (c) => {
      const user = c.get("user");
      const query = c.req.valid("query");
      const result = await repos.organization.listPendingInvitationsByEmail(
        user.email || "",
        query,
      );

      return c.json(result, 200);
    },
  );

  const acceptInvitationRoute = createEndpoint(
    createStandardRoute({
      ...userContracts.acceptInvitation,
      responses: {
        ...commonResponses.ok(
          z.object({ success: z.boolean() }),
          "Invitation accepted successfully",
        ),
        ...commonResponses.badRequest("Invalid or expired invitation"),
      },
    }),
    async (c) => {
      const user = c.get("user");
      if (!user) throw new AppError("FORBIDDEN");

      const { invitationId } = c.req.valid("param");

      const result = await repos.user.joinOrganization(user.id, invitationId);

      if (!result.success) {
        throw new AppError("BAD_REQUEST", result.error);
      }

      const { organizationId } = result;

      const inv = invalidator(c);
      inv.organizationList(user.id);
      if (organizationId) {
        inv.organizationMembers(organizationId);
      }

      return c.json({ success: true }, 200);
    },
  );

  return { getRoute, updateRoute, invitationsRoute, acceptInvitationRoute };
}
