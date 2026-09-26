import { expect, it } from "vitest";

import type { Equal, Expect, Extends } from "./types";

it("tip iddiaları derlenir", () => {
  const cases: [
    Expect<Equal<string, string>>,
    Expect<Extends<"active", string>>,
  ] = [true, true];
  expect(cases).toEqual([true, true]);
});
