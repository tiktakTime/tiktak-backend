import { AppError } from "@/core/errors";
import * as repo from "@/modules/access/access.repo";

import type { AccessUpdate } from "../access.schema";

export async function updateAccess(id: string, input: AccessUpdate) {
  const row = await repo.update(id, input);
  if (!row) throw new AppError("ACCESS_NOT_FOUND");
  return row;
}
