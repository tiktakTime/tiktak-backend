import { describe, expect, it } from "vitest";

import { sha256 } from "./hash";

describe("sha256", () => {
  it("is stable and hex", () => {
    expect(sha256("tiktak")).toMatch(/^[a-f0-9]{64}$/);
    expect(sha256("tiktak")).toBe(sha256("tiktak"));
    expect(sha256("a")).not.toBe(sha256("b"));
  });
});
