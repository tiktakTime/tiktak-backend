# Server

Composition root: uygulamayı **kurar**, dinlemez.

| Referans     | Konum                                             |
| ------------ | ------------------------------------------------- |
| Mimari       | [`docs/architecture.md`](../docs/architecture.md) |
| Motor indeks | [`core/doc.md`](../core/doc.md)                   |
| Süreç girişi | kök [`index.ts`](../index.ts)                     |

**Dosyalar:** `index.ts` (`buildServer`), `openapi.ts` (`mountOpenAPI`)

---

## `buildServer()` — adım adım

```ts
export function buildServer() {
  // 1 — i18n + route platform + cache
  configureI18n({ bundles, defaultLocale: "en", errorMeta: ERROR_META });
  configureRoutePlatform({ hydrateScope, scopes, checkPolicy, resolveTenantId, resolveActorId });
  configureCache({ invalidate_key_type: app_config.cache.invalidate_key_type });

  // 2
  const api = createRouter();
  api.use("*", rate_limit.standard);

  // 3 — cast ile mount helper
  const mount = (router: AppOpenAPI, path = "/") => api.route(path, router);

  // 4 — surfaces dışı
  mount(healthRouter); // apps/system
  mount(authRouter); // apps/auth (melez authlı/authsuz)

  // 5 — yüzeyler
  for (const [name, surface] of Object.entries(app_config.surfaces)) {
    if (surface.enabled) {
      mount(surfaceRouters[name], surface.prefix || "/");
    }
  }

  // 6
  mountOpenAPI(api);

  // 7 — kök app + API prefix
  return createApp().route(env.API_BASE_PATH, api);
}
```

### Mount path prefix’leri

| Router         | Prefix                                             | Not                   |
| -------------- | -------------------------------------------------- | --------------------- |
| `healthRouter` | `/`                                                | readiness/liveness    |
| `authRouter`   | `/`                                                | surfaces döngüsü dışı |
| `publicRouter` | `app_config.surfaces.public.prefix` (şimdilik `/`) | auth yok              |
| `commonRouter` | `/`                                                | authMiddleware        |
| `webRouter`    | `/`                                                | auth + permission     |
| `mobileRouter` | `/`                                                | disabled              |
| `adminRouter`  | `/`                                                | disabled              |

Gerçek URL: `{host}{API_BASE_PATH}{routePath}` — örn. `/api/...` veya gateway `/api-test/...`.

### Neden `mount` cast?

Deep OpenAPI route union’ları TS instantiation limitini aşar. `AppOpenAPI` cast tek noktada toplanır; runtime etkisi yok.

---

## OpenAPI (`openapi.ts`)

| Path                                             | Ortam               | Amaç                      |
| ------------------------------------------------ | ------------------- | ------------------------- |
| `app_config.openapi.spec_path` (`/openapi.json`) | **Her ortam**       | Client codegen / contract |
| `app_config.openapi.docs_path` (`/docs`)         | **Production dışı** | Scalar UI                 |

`mountOpenAPI`:

1. `securitySchemes.bearer` — HTTP Bearer JWT
2. `app.doc(spec_path, { openapi: "3.1.0", info: … })`
3. prod değilse Scalar → `url: API_BASE_PATH + spec_path`

Production’da spec erişilebilir kalır; browsable UI kapalı.

---

## Bağımlılık listesi

| Kaynak         | Import                                                                     |
| -------------- | -------------------------------------------------------------------------- |
| Kararlar       | `app.config`                                                               |
| Router’lar     | `apps/admin`, `auth`, `common`, `mobile`, `public`, `system/health`, `web` |
| Cache boot     | `core/cache` (`configureCache`)                                            |
| Env            | `core/env` (`API_BASE_PATH`)                                               |
| Router         | `core/router` (`createApp`, `createRouter`, `AppOpenAPI`)                  |
| HTTP boot      | `core/http` (`configureI18n`, `configureRoutePlatform`)                    |
| i18n içerik    | `platform/i18n` (`bundles`, `ERROR_META`)                                  |
| Scope          | `platform/scope` (`hydrateScope`)                                          |
| Rate limit     | `middlewares/rate-limit`                                                   |

Domain/repo import **yok** — yalnızca app barrel router’ları.

---

## `index.ts` ile ilişki

| Sorumluluk | Dosya                                                                                  |
| ---------- | -------------------------------------------------------------------------------------- |
| App graph  | `buildServer()` → `fetch` handler                                                      |
| Dinleme    | `serve({ fetch: buildServer().fetch, port: env.PORT })`                                |
| WebSocket  | `attachSocketServer(httpServer)` — aynı port                                           |
| Shutdown   | SIGINT/SIGTERM → `closeSocket` → HTTP close → `closeQueues` → `closeRedis` → `closeDb` |

Testler de `buildServer()` kullanır — ayrı listen gerekmez.

---

## Dev konsol çıktısı

```
listening on http://localhost:{PORT}{API_BASE_PATH}
docs      http://localhost:{PORT}{API_BASE_PATH}/docs   (non-prod)
socket    http://localhost:{PORT}/socket.io
```
