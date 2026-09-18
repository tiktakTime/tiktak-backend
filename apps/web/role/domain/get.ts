import { AppError } from "@/core/errors";
import * as repo from "@/modules/role/role.repo";

export async function getRole(id: string) {
  const row = await repo.findById(id);
  if (!row) throw new AppError("ROLE_NOT_FOUND");
  return row;
}
