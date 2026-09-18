#!/usr/bin/env node
/**
 * Cache + Socket.IO triad — user/org scoped.
 * Requires running tiktak-backend + Redis.
 * Usage: node scripts/test-cache-socket.mjs
 */
import Redis from "ioredis";
import { io } from "socket.io-client";

const BASE = process.env.E2E_BASE ?? "http://localhost:3001/api-test";
const SOCKET_URL = process.env.E2E_SOCKET ?? "http://localhost:3001";
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const EMAIL = process.env.E2E_EMAIL ?? "e2e-test@tiktak.local";
const PASSWORD = process.env.E2E_PASSWORD ?? "E2eTestPass123!";

const results = [];

function ok(name, detail = "") {
  results.push({ name, pass: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  results.push({ name, pass: false, detail });
  console.error(`FAIL  ${name} — ${detail}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
      `${method} ${path} expected ${expectStatus}, got ${res.status}: ${text.slice(0, 400)}`,
    );
  }
  return { status: res.status, json };
}

async function scanCacheKeys(redis, match = "cache:*") {
  const keys = [];
  let cursor = "0";
  do {
    const [next, batch] = await redis.scan(
      cursor,
      "MATCH",
      match,
      "COUNT",
      200,
    );
    cursor = next;
    keys.push(...batch);
  } while (cursor !== "0");
  return keys;
}

async function readEntry(redis, redisKey) {
  const raw = await redis.get(redisKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return { _raw: raw };
  }
}

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const sock = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
    });
    const t = setTimeout(() => {
      sock.close();
      reject(new Error("socket connect timeout"));
    }, 8000);
    sock.on("connect", () => {
      clearTimeout(t);
      resolve(sock);
    });
    sock.on("connect_error", (err) => {
      clearTimeout(t);
      reject(err);
    });
  });
}

function waitForInvalidate(sock, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      sock.off("invalidate", onEvent);
      reject(new Error("timeout waiting for invalidate"));
    }, timeoutMs);
    function onEvent(payload) {
      clearTimeout(t);
      sock.off("invalidate", onEvent);
      resolve(payload);
    }
    sock.on("invalidate", onEvent);
  });
}

async function main() {
  const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  try {
    await redis.connect();
    const pong = await redis.ping();
    if (pong === "PONG") ok("redis ping");
    else fail("redis ping", pong);
  } catch (err) {
    fail("redis ping", err.message);
    console.error("\nRedis yok — cache triad testi durdu.");
    process.exit(1);
  }

  let access;
  {
    const login = await req("POST", "/auth/sign-in", {
      body: { email: EMAIL, password: PASSWORD },
      expectStatus: 200,
    });
    access = login.json?.data?.access_token;
    if (access) ok("auth sign-in");
    else {
      fail("auth sign-in", JSON.stringify(login.json));
      await redis.quit();
      process.exit(1);
    }
  }

  let userId;
  {
    const member = await req("GET", "/auth/member", {
      token: access,
      expectStatus: 200,
    });
    userId = member.json?.data?.user_id;
    if (userId) ok("auth member", `org=${member.json.data.organization_id ?? "null"}`);
    else fail("auth member", JSON.stringify(member.json));
  }

  // Unscoped GET must not write global cache key
  {
    const globals = await scanCacheKeys(redis, "cache:/organization/search*");
    if (globals.length) await redis.del(...globals);
    await req("GET", "/organization/search?page=1&limit=5", {
      expectStatus: 200,
    });
    await sleep(50);
    const after = await scanCacheKeys(redis, "cache:/organization/search*");
    if (after.length === 0) ok("no cache without auth (user scope)");
    else fail("no cache without auth (user scope)", after.join(","));
  }

  const searchPath = "/organization/search?page=1&limit=5";
  const logicalKey = `user:${userId}||/organization/search:{"limit":"5","page":"1"}`;
  const redisKey = `cache:${logicalKey}`;

  {
    const before = await scanCacheKeys(redis, `cache:user:${userId}||/organization/search*`);
    if (before.length) await redis.del(...before);
    ok("cache clear user-scoped org search", `deleted=${before.length}`);
  }

  {
    await req("GET", searchPath, { token: access, expectStatus: 200 });
    await sleep(50);
    const entry = await readEntry(redis, redisKey);
    if (entry?.data && typeof entry.createdAt === "number") {
      ok("cache miss → user-scoped set", redisKey);
    } else {
      fail(
        "cache miss → user-scoped set",
        `keys=${(await scanCacheKeys(redis, "cache:user:*")).slice(0, 5).join(",")}`,
      );
    }
  }

  {
    const entry1 = await readEntry(redis, redisKey);
    await req("GET", searchPath, { token: access, expectStatus: 200 });
    await sleep(50);
    const entry2 = await readEntry(redis, redisKey);
    if (entry1?.createdAt && entry2?.createdAt === entry1.createdAt) {
      ok("cache hit (createdAt stable)", String(entry1.createdAt));
    } else {
      fail(
        "cache hit (createdAt stable)",
        `before=${entry1?.createdAt} after=${entry2?.createdAt}`,
      );
    }
  }

  let sock;
  let invalidatePromise;
  try {
    sock = await connectSocket(access);
    ok("socket connect with JWT", sock.id);
    invalidatePromise = waitForInvalidate(sock, 8000);
  } catch (err) {
    fail("socket connect with JWT", err.message);
  }

  const orgName = `cache-socket-test-${Date.now()}`;
  let createdId;
  {
    const created = await req("POST", "/organization", {
      token: access,
      body: {
        company_name: orgName,
        business_type: "sole_proprietorship",
      },
      expectStatus: 201,
    });
    createdId = created.json?.data?.id;
    if (createdId) ok("org create (mutation)", createdId);
    else fail("org create (mutation)", JSON.stringify(created.json));
  }

  if (invalidatePromise) {
    try {
      const payload = await invalidatePromise;
      const flat = JSON.stringify(payload);
      const hasSearchKey =
        Array.isArray(payload) &&
        payload.some(
          (k) =>
            Array.isArray(k) &&
            typeof k[0] === "string" &&
            /GetOrganizationSearch/i.test(k[0]),
        );
      if (hasSearchKey) ok("socket invalidate → user room", flat.slice(0, 180));
      else fail("socket invalidate → user room", flat.slice(0, 300));
    } catch (err) {
      fail("socket invalidate → user room", err.message);
    }
  }

  await sleep(150);
  {
    const entry = await readEntry(redis, redisKey);
    if (!entry) ok("user-scoped cache invalidated");
    else fail("user-scoped cache invalidated", "key still present");
  }

  // Org-scoped get key after switch-like context (path id = org)
  if (createdId) {
    const orgGetKey = `cache:org:${createdId}||/organization/${createdId}`;
    await req("GET", `/organization/${createdId}`, {
      token: access,
      expectStatus: 200,
    });
    await sleep(50);
    const entry = await readEntry(redis, orgGetKey);
    if (entry?.data) ok("org-scoped get cache", orgGetKey);
    else {
      fail(
        "org-scoped get cache",
        `missing; sample=${(await scanCacheKeys(redis, "cache:org:*")).slice(0, 3).join(",")}`,
      );
    }

    if (sock) {
      const inv2 = waitForInvalidate(sock, 8000);
      try {
        await req("DELETE", `/organization/${createdId}`, {
          token: access,
          expectStatus: 200,
        });
        const payload = await inv2;
        const flat = JSON.stringify(payload);
        // delete invalidates user search + org get → user room still receives
        if (Array.isArray(payload) && payload.length > 0) {
          ok("socket invalidate on delete (user room)", flat.slice(0, 200));
        } else fail("socket invalidate on delete (user room)", flat);

        await sleep(150);
        const after = await readEntry(redis, orgGetKey);
        if (!after) ok("org-scoped get cache cleared");
        else fail("org-scoped get cache cleared", "still present");
      } catch (err) {
        fail("org delete / invalidate", err.message);
      }
    }
  }

  sock?.close();
  await redis.quit();

  const failed = results.filter((r) => !r.pass).length;
  console.log(
    `\n${results.length - failed}/${results.length} passed` +
      (failed ? ` (${failed} failed)` : ""),
  );
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
