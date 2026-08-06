export const UserStatus = {
  active: "active",
  inactive: "inactive",
  blocked: "blocked",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const UserGender = {
  female: "female",
  male: "male",
  none: "none",
} as const;
export type UserGender = (typeof UserGender)[keyof typeof UserGender];

export const OrganizationStatus = {
  active: "active",
  inactive: "inactive",
  blocked: "blocked",
} as const;
export type OrganizationStatus =
  (typeof OrganizationStatus)[keyof typeof OrganizationStatus];

export const OrganizationBusinessType = {
  sole_proprietorship: "sole_proprietorship",
  corporation: "corporation",
} as const;
export type OrganizationBusinessType =
  (typeof OrganizationBusinessType)[keyof typeof OrganizationBusinessType];

export const OrganizationLegalForm = {
  gmbh: "gmbh",
  ug: "ug",
  ag: "ag",
  kgaa: "kgaa",
  gmbh_co_kg: "gmbh_co_kg",
  ug_co_kg: "ug_co_kg",
  ag_co_kg: "ag_co_kg",
  se: "se",
} as const;
export type OrganizationLegalForm =
  (typeof OrganizationLegalForm)[keyof typeof OrganizationLegalForm];

export const SocialMediaPlatform = {
  instagram: "instagram",
  facebook: "facebook",
  linkedin: "linkedin",
  tiktok: "tiktok",
  twitter: "twitter",
  youtube: "youtube",
  website: "website",
} as const;
export type SocialMediaPlatform =
  (typeof SocialMediaPlatform)[keyof typeof SocialMediaPlatform];

export const InviteStatus = {
  pending: "pending",
  accepted: "accepted",
  expired: "expired",
  canceled: "canceled",
} as const;
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];

export const PersonPermissionEffect = {
  grant: "grant",
  deny: "deny",
} as const;
export type PersonPermissionEffect =
  (typeof PersonPermissionEffect)[keyof typeof PersonPermissionEffect];
