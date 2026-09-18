/** Socket oda / event adları — ürün sabitleri. */
export const SOCKET_ROOM_PREFIX = {
  user: "user",
  org: "org",
} as const;

export const SOCKET_EVENT = {
  joinOrganization: "join:organization",
  leaveOrganization: "leave:organization",
} as const;

/** İstekten organization id ararken denenecek anahtarlar (öncelik sırası). */
export const SCOPE_ORG_KEYS = ["organization_id", "org_id", "orgId"] as const;
