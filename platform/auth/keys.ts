/** Oturum kaydı için Redis anahtarı. */
export function sessionKey(sid: string) {
  return `session:${sid}`;
}

/** Refresh token hash’i için Redis anahtarı. */
export function refreshKey(hash: string) {
  return `refresh:${hash}`;
}

/** Kullanıcıya bağlı oturum id seti. */
export function userSessionsKey(userId: string) {
  return `user_sessions:${userId}`;
}
