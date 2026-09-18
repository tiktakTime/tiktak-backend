import { AppError } from "@/core/errors";
import * as repo from "@/modules/person/person.repo";

export async function getPerson(orgId: string, id: string) {
  const row = await repo.findById(orgId, id);
  if (!row) throw new AppError("PERSON_NOT_FOUND");
  return row;
}
