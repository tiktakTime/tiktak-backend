import z from "zod";

import {
  MembershipRoleSchema,
  OrganizationInvitationSchema,
  UserSchema,
} from "@tiktak/database";

export const CreateInvitationSchema = OrganizationInvitationSchema.pick({
  email: true,
  roleId: true,
});

export type CreateInvitation = z.infer<typeof CreateInvitationSchema>;

export const InvitationResponseSchema = OrganizationInvitationSchema.extend({
  invitedBy: UserSchema.pick({
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

export type InvitationResponse = z.infer<typeof InvitationResponseSchema>;
