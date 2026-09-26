import * as personRepo from "@/modules/person/person.repo";

type PersonInput = personRepo.PersonInsertValues;

/** Org zorunlu. İsim verilmezse sabit test adı kullanır. */
export async function makePerson(
  overrides: Partial<PersonInput> & Pick<PersonInput, "organization_id">,
) {
  return personRepo.insert({
    first_name: "Ada",
    last_name: "Lovelace",
    ...overrides,
  });
}
