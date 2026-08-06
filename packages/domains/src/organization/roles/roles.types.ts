import z from "zod";

import { MembershipRoleSchema } from "@tiktak/database";

export const CreateRoleSchema = MembershipRoleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  organizationId: true,
});

export type CreateRole = z.infer<typeof CreateRoleSchema>;

export const UpdateRoleSchema = CreateRoleSchema.partial();

export type UpdateRole = z.infer<typeof UpdateRoleSchema>;
