/**
 * Lemonerce starter domains were removed — they targeted OrganizationInvitation /
 * MembershipRole / User.name which do not exist in humans schema.
 *
 * Reimplement against invite / role / person / user (snake_case) in Faz 3–4.
 * API routers stay unmounted until then (see apps/api/src/app/index.ts).
 */

export type { DB, Database } from "./types";
