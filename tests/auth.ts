import {
  type SessionOrgFields,
  type SessionUserSnapshot,
  createSession,
} from "@/platform/auth";

/** Gerçek oturum açar, access token döner. */
export async function signInAs(
  user: SessionUserSnapshot & { id: string },
  org?: SessionOrgFields | null,
): Promise<string> {
  const pair = await createSession(user.id, org ?? null, {
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    picture: user.picture ?? null,
  });
  return pair.access_token;
}
