export * from "./validate-path";
export * from "./validation";

export const ORG_ID_VAR = "{orgId}";
export const ORGANIZATION_PATH = "/org";
export const ORGANIZATION_WITH_ID_PATH = `${ORGANIZATION_PATH}/${ORG_ID_VAR}`;

export const org = <T extends string>(path: T) =>
  `${ORGANIZATION_PATH}${path}` as const;
export const orgId = <T extends string>(path: T) =>
  `${ORGANIZATION_WITH_ID_PATH}${path}` as const;

export const tags = {
  asset: "Asset",
  user: "User",
  auth: "Auth",
  organization: "Organization",
  content: "Content",
  media: "Media",
  exchangeRates: "Exchange Rates",
  pim: "PIM",
  customer: "Customer",
  order: "Order",
  logistics: "Logistics",
  system: "System",
  mail: "Mail",
  translation: "Translation",
  webhook: "Webhook",
  notification: "Notification",
} as const;
