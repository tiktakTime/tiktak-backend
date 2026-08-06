import z from "zod";

import {
  MembershipRoleSchema,
  OrganizationMembershipSchema,
  UserSchema,
} from "@tiktak/database";

export const UpdateMembershipSchema = OrganizationMembershipSchema.pick({
  roleId: true,
});

export type UpdateMembership = z.infer<typeof UpdateMembershipSchema>;

export const MembershipResponseSchema = OrganizationMembershipSchema.extend({
  user: UserSchema.pick({
    id: true,
    name: true,
    email: true,
    avatar: true,
  }).nullable(),
  role: MembershipRoleSchema.pick({
    id: true,
    name: true,
  }).nullable(),
});

export type MembershipResponse = z.infer<typeof MembershipResponseSchema>;
