export const INVITE_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  EXPIRED: "expired",
  CANCELED: "canceled",
} as const;

export type InviteStatusValue =
  (typeof INVITE_STATUS)[keyof typeof INVITE_STATUS];

export const INVITE_TTL_DAYS = 7;
