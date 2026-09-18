import { AppError } from "@/core/errors";
import * as repo from "@/modules/user/user.repo";

export async function getUser(id: string) {
  const row = await repo.findById(id);
  if (!row) throw new AppError("USER_NOT_FOUND");
  return row;
}
