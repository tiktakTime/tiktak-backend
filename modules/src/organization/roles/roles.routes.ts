import { z } from "zod";

import {
  AppError,
  DeleteResponseSchema,
  commonResponses,
  createEndpoint,
  createStandardRoute,
} from "@tiktak/core";
import { MembershipRoleSchema } from "@tiktak/database";

import { RoleRepository } from "./roles.repo";
import * as rolesContracts from "./roles.contract";
import { CreateRoleSchema, UpdateRoleSchema } from "./roles.types";

export function createOrganizationRolesRoutes(repos: { role: RoleRepository }) {
  const listRoute = createEndpoint(
    createStandardRoute({
      ...rolesContracts.rolesList,
      responses: {
        ...commonResponses.ok(
          z.array(MembershipRoleSchema),
          "List of organization roles",
        ),
      },
    }),
    async (c) => {
      const { orgId } = c.req.valid("param");
      const data = await repos.role.findAllByOrganizationId(orgId);

      return c.json(data, 200);
    },
  );

  const createRoute = createEndpoint(
    createStandardRoute({
      ...rolesContracts.rolesCreate,
      jsonBody: {
        schema: CreateRoleSchema,
        description: "Role details and permissions",
      },
      responses: {
        ...commonResponses.created(
          MembershipRoleSchema,
          "Role created successfully",
        ),
      },
    }),
    async (c) => {
      const { orgId } = c.req.valid("param");
      const json = c.req.valid("json");

      const data = await repos.role.create(orgId, json);

      return c.json(data, 201);
    },
  );

  const getRoute = createEndpoint(
    createStandardRoute({
      ...rolesContracts.rolesGet,
      responses: {
        ...commonResponses.ok(MembershipRoleSchema, "Role details"),
        ...commonResponses.notFound("Role not found"),
      },
    }),
    async (c) => {
      const { orgId, roleId } = c.req.valid("param");

      const data = await repos.role.findById(orgId, roleId);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      return c.json(data, 200);
    },
  );

  const updateRoute = createEndpoint(
    createStandardRoute({
      ...rolesContracts.rolesUpdate,
      jsonBody: {
        schema: UpdateRoleSchema,
        description: "Permissions to update",
      },
      responses: {
        ...commonResponses.ok(MembershipRoleSchema, "Role updated successfully"),
        ...commonResponses.notFound("Role not found"),
      },
    }),
    async (c) => {
      const { orgId, roleId } = c.req.valid("param");
      const json = c.req.valid("json");

      const data = await repos.role.update(orgId, roleId, json);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      return c.json(data, 200);
    },
  );

  const deleteRoute = createEndpoint(
    createStandardRoute({
      ...rolesContracts.rolesDeletee,
      responses: {
        ...commonResponses.ok(DeleteResponseSchema, "Role deleted successfully"),
        ...commonResponses.notFound("Role not found"),
      },
    }),
    async (c) => {
      const { orgId, roleId } = c.req.valid("param");

      const data = await repos.role.delete(orgId, roleId);

      if (!data) {
        throw new AppError("ENTITY_NOT_FOUND");
      }

      return c.json({ id: roleId, status: "deleted" } as const, 200);
    },
  );

  return { listRoute, createRoute, getRoute, updateRoute, deleteRoute };
}
