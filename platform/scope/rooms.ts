import type { SocketRoomBinding } from "@/core/socket";
import { getSession } from "@/platform/auth";

import { SOCKET_EVENT, SOCKET_ROOM_PREFIX } from "./constants";

/** Kullanıcının kendi odası — bağlanınca otomatik katılır. */
export function userRoom(userId: string): string {
  return `${SOCKET_ROOM_PREFIX.user}:${userId}`;
}

export function orgRoom(organizationId: string): string {
  return `${SOCKET_ROOM_PREFIX.org}:${organizationId}`;
}

/**
 * Org odasına yalnızca oturumun aktif organizasyonu için katılınabilir.
 * Süper admin muaf. Aksi halde herkes `join:organization` ile başka bir
 * organizasyonun invalidate trafiğini dinleyebilirdi.
 */
async function canJoinOrganization(
  identity: { session?: string },
  organizationId: string,
): Promise<boolean> {
  if (!identity.session) return false;
  const session = await getSession(identity.session);
  if (!session) return false;
  if (session.is_super_admin) return true;
  return session.organization_id === organizationId;
}

export const socketRoomBindings: SocketRoomBinding[] = [
  {
    join: SOCKET_EVENT.joinOrganization,
    leave: SOCKET_EVENT.leaveOrganization,
    prefix: SOCKET_ROOM_PREFIX.org,
    canJoin: canJoinOrganization,
  },
];
