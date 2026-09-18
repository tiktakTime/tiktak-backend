import { AppError } from "@/core/errors";
import * as repo from "@/modules/access/access.repo";

export async function getAccess(id: string) {
  const row = await repo.findById(id);
  if (!row) throw new AppError("ACCESS_NOT_FOUND");
  return row;
}
