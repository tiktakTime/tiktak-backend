/** Authorization header’dan Bearer token’ı ayıkla. */
export function extractBearerToken(
  authorization: string | undefined,
): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;
  return token;
}
