#!/usr/bin/env node
/**
 * End-to-end smoke against a running tiktak-backend (default :3001 /api-test).
 * Usage: node scripts/e2e-smoke.mjs
 */
import { io } from "socket.io-client";

const BASE = process.env.E2E_BASE ?? "http://localhost:3001/api-test";
const SOCKET_URL = process.env.E2E_SOCKET ?? "http://localhost:3001";

const results = [];

function ok(name, detail = "") {
  results.push({ name, pass: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  results.push({ name, pass: false, detail });
  console.error(`FAIL  ${name} — ${detail}`);
}

async function req(method, path, { body, token, expectStatus } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { _raw: text };
  }
  if (expectStatus !== undefined && res.status !== expectStatus) {
    throw new Error(
      `${method} ${path} expected ${expectStatus}, got ${res.status}: ${text.slice(0, 300)}`,
    );
  }
  return { status: res.status, json, headers: res.headers };
}

async function main() {
  // 1) Health
  {
    const h = await req("GET", "/health", { expectStatus: 200 });
    if (h.json?.status === "ok") ok("health");
    else fail("health", JSON.stringify(h.json));
  }
  {
    const r = await req("GET", "/health/ready", { expectStatus: 200 });
    if (r.json?.status === "ok" && r.json?.database === "ok")
      ok("health/ready");
    else fail("health/ready", JSON.stringify(r.json));
  }

  // 2) OpenAPI
  {
    const spec = await req("GET", "/openapi.json", { expectStatus: 200 });
    if (spec.json?.openapi && spec.json?.info?.title) {
      ok("openapi.json", spec.json.info.title);
    } else fail("openapi.json", "missing openapi/info");
  }
  {
    const docs = await fetch(`${BASE}/docs`);
    if (docs.status === 200) ok("docs UI");
    else fail("docs UI", `status ${docs.status}`);
  }

  // 3) Auth — bad sign-in
  {
    const bad = await req("POST", "/auth/sign-in", {
      body: { email: "e2e-test@tiktak.local", password: "wrong-password" },
      expectStatus: 401,
    });
    if (bad.json?.code === "UNAUTHORIZED") ok("auth sign-in reject");
    else fail("auth sign-in reject", JSON.stringify(bad.json));
  }

  // 4) Auth — sign-in / refresh / logout
  let access;
  let refresh;
  {
    const login = await req("POST", "/auth/sign-in", {
      body: { email: "e2e-test@tiktak.local", password: "E2eTestPass123!" },
      expectStatus: 200,
    });
    access = login.json?.data?.access_token;
    refresh = login.json?.data?.refresh_token;
    if (access && refresh && login.json?.data?.token_type === "Bearer") {
      ok("auth sign-in", `expires_in=${login.json.data.expires_in}`);
    } else fail("auth sign-in", JSON.stringify(login.json));
  }
  {
    const rotated = await req("POST", "/auth/refresh", {
      body: { refresh_token: refresh },
      expectStatus: 200,
    });
    if (rotated.json?.data?.access_token && rotated.json?.data?.refresh_token) {
      access = rotated.json.data.access_token;
      refresh = rotated.json.data.refresh_token;
      ok("auth refresh");
    } else fail("auth refresh", JSON.stringify(rotated.json));
  }

  // 5) Socket JWT
  await new Promise((resolve) => {
    let done = false;
    const finish = (fn) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      fn();
      rejected.close();
      resolve();
    };
    const rejected = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: false,
      timeout: 3000,
    });
    const timer = setTimeout(
      () => finish(() => fail("socket reject without token", "timeout")),
      4000,
    );
    rejected.on("connect_error", (err) =>
      finish(() => ok("socket reject without token", err.message)),
    );
    rejected.on("connect", () =>
      finish(() =>
        fail("socket reject without token", "connected unexpectedly"),
      ),
    );
  });

  await new Promise((resolve) => {
    let done = false;
    const finish = (fn) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      fn();
      sock.close();
      resolve();
    };
    const sock = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: access },
      reconnection: false,
      timeout: 4000,
    });
    const timer = setTimeout(
      () => finish(() => fail("socket connect with JWT", "timeout")),
      5000,
    );
    sock.on("connect", () =>
      finish(() => ok("socket connect with JWT", sock.id)),
    );
    sock.on("connect_error", (err) =>
      finish(() => fail("socket connect with JWT", err.message)),
    );
  });

  // 6) Auth required on user routes; empty permissions → FORBIDDEN until switch
  {
    const unauth = await req("GET", "/user/search?page=1&limit=5", {
      expectStatus: 401,
    });
    if (unauth.json?.code === "UNAUTHORIZED") ok("user search requires auth");
    else fail("user search requires auth", JSON.stringify(unauth.json));
  }
  {
    const forbidden = await req("GET", "/user/search?page=1&limit=5", {
      token: access,
      expectStatus: 403,
    });
    if (forbidden.json?.code === "FORBIDDEN") {
      ok("user search FORBIDDEN without switch/permissions");
    } else {
      fail(
        "user search FORBIDDEN without switch/permissions",
        JSON.stringify(forbidden.json),
      );
    }
  }

  // 7) Organization create (requireMember) + permission gates
  let orgId;
  {
    const created = await req("POST", "/organization", {
      token: access,
      body: {
        company_name: `E2E Org ${Date.now()}`,
        business_type: "corporation",
      },
      expectStatus: 201,
    }).catch(async (e) => {
      fail("organization create", String(e.message));
      return null;
    });
    if (created) {
      orgId = created.json?.data?.id;
      if (orgId) ok("organization create", orgId);
      else fail("organization create", JSON.stringify(created.json));
    }
  }
  if (orgId) {
    const searchForbidden = await req(
      "GET",
      `/organization/search?page=1&limit=10`,
      { token: access, expectStatus: 403 },
    );
    if (searchForbidden.json?.code === "FORBIDDEN") {
      ok("organization search FORBIDDEN without switch");
    } else {
      fail(
        "organization search FORBIDDEN without switch",
        JSON.stringify(searchForbidden.json),
      );
    }

    const switched = await req("GET", `/auth/switch/${orgId}`, {
      token: access,
      expectStatus: 200,
    }).catch((e) => {
      fail("auth switch after org create", String(e.message));
      return null;
    });
    if (switched?.json?.data?.organization_id === orgId) {
      ok(
        "auth switch after org create",
        `permissions=${(switched.json.data.permissions || []).length}`,
      );
    } else if (switched) {
      fail("auth switch after org create", JSON.stringify(switched.json));
    }
  }

  // 8) Validation 422 (auth required; param validate before permission)
  {
    await req("GET", "/user/not-a-uuid", { token: access, expectStatus: 422 });
    ok("validation 422 on bad uuid");
  }

  // 9) Logout + replay refresh should fail
  {
    await req("POST", "/auth/logout", { token: access, expectStatus: 200 });
    ok("auth logout");
  }
  {
    await req("POST", "/auth/refresh", {
      body: { refresh_token: refresh },
      expectStatus: 401,
    });
    ok("auth refresh after logout rejected");
  }
  {
    await req("POST", "/auth/logout", { expectStatus: 401 });
    ok("auth logout without token rejected");
  }

  const failed = results.filter((r) => !r.pass);
  console.log("\n---");
  console.log(
    `Result: ${results.length - failed.length}/${results.length} passed`,
  );
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
