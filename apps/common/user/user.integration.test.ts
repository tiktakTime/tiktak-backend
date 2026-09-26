import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { buildServer } from "@/server";

import { signInAs } from "../../../tests/auth";
import { makeUser } from "../../../tests/factories";
import { request } from "../../../tests/request";

const app = buildServer();

describe("user", () => {
  it("oluşturur, getirir ve olmayanı 404 döner", async () => {
    const actor = await makeUser();
    const token = await signInAs(actor, { permissions: ["user.get"] });
    const email = `${randomUUID()}@example.test`;

    const created = await request(app, "/user", {
      method: "POST",
      token,
      body: { first_name: "Ada", last_name: "Lovelace", email },
    });
    expect(created.status).toBe(200);
    const id = idOf(created.body);

    const got = await request(app, `/user/${id}`, { token });
    expect(got.status).toBe(200);

    const listed = await request(app, "/user/search", { token });
    expect(listed.status).toBe(200);

    const missing = await request(
      app,
      "/user/00000000-0000-4000-8000-000000000099",
      { token },
    );
    expect(missing.status).toBe(404);
    expect(errorCode(missing.body)).toBe("USER_NOT_FOUND");
  });
});

function idOf(body: unknown): string {
  const id = (body as { data?: { id?: string } }).data?.id;
  if (!id) throw new Error("id yok");
  return id;
}

function errorCode(body: unknown): string {
  if (typeof body !== "object" || body === null || !("code" in body)) return "";
  const code = (body as { code: unknown }).code;
  return typeof code === "string" ? code : "";
}
