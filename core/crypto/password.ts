import bcrypt from "bcryptjs";

/** bcrypt hash. Maliyet 10. */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Hash boşsa eşleşme yoktur. */
export async function passwordMatches(
  password: string,
  hash: string | null,
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
