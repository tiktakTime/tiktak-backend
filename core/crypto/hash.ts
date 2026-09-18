import { createHash } from "node:crypto";

/** SHA-256 hex özet. */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
