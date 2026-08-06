import z from "zod";

import { PaginationSchema, SearchSchema } from "@tiktak/core";
import { OrganizationSchema } from "@tiktak/database";

export const CreateOrganizationSchema = OrganizationSchema.pick({
  name: true,
  slug: true,
  ownerUserId: true,
});

export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = OrganizationSchema.pick({
  name: true,
  slug: true,
  currencies: true,
  defaultCurrency: true,
  isTaxIncluded: true,
  isShippingIncluded: true,
  avatar: true,
}).partial();

export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;

export const OrganizationListQuerySchema = PaginationSchema.extend(
  SearchSchema.shape,
);
export type OrganizationListParams = z.infer<
  typeof OrganizationListQuerySchema
>;

export const ListPendingInvitationsQuerySchema = PaginationSchema.extend(
  SearchSchema.shape,
);
export type ListPendingInvitationsParams = z.infer<
  typeof ListPendingInvitationsQuerySchema
>;

export const TransferOwnershipSchema = z.object({
  newOwnerUserId: z.string().uuid(),
});

export type TransferOwnership = z.infer<typeof TransferOwnershipSchema>;

export const OrganizationResponseSchema = OrganizationSchema.extend({
  owner: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string(),
      avatar: z.string().nullable(),
    })
    .nullable(),
});

export type OrganizationResponse = z.infer<typeof OrganizationResponseSchema>;
