# Middlewares

Hono middleware’leri: kimlik, yetki, rate limit. İnce katman — iş kuralı yok.

| Referans    | Konum                                             |
| ----------- | ------------------------------------------------- |
| Mimari      | [`docs/architecture.md`](../docs/architecture.md) |
| Motor       | [`core/doc.md`](../core/doc.md)                   |
| Auth motoru | [`platform/auth/doc.md`](../platform/auth/doc.md) |

Barrel: `@/middlewares`

---

## Kurallar

| Kural       | Anlam                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| İnce katman | Context set / erken reddet; repo/domain çağrısı yok                        |
| Bağımlılık  | `middlewares` → `platform` / `core` (+ `app.config`); ↛ `apps` / `modules` |
| Mount yeri  | Global → `server/`; yüzey → `apps/*/index.ts`; route → tek endpoint        |

---

## Dosyalar

| Dosya           | Export                                            |
| --------------- | ------------------------------------------------- |
| `auth.ts`       | `authMiddleware`, `optionalAuthMiddleware`        |
| `permission.ts` | `assert*` / `require*`                            |
| `rate-limit.ts` | `rate_limit`, `createRateLimit`, `clearRateLimit` |
| `index.ts`      | barrel                                            |

---

## auth (`auth.ts`)

### `authMiddleware` — adımlar

1. `extractBearerToken(Authorization header)` — yok → `AppError("UNAUTHORIZED", "missing_bearer")`
2. `verifyAccessToken(token)` — JWT + Redis session kontrolü
3. `getSession(sid)` — context’e session alanları:
   - `user_id` ← JWT `sub`
   - `session_id` ← JWT `sid`
   - `organization_id`, `permissions`, `person_id`, `role_id`, `is_super_admin` ← `SessionRecord`
4. Hata → `AppError("UNAUTHORIZED", "invalid_token")`
5. `next()`

### `optionalAuthMiddleware`

1. Bearer yok → doğrudan `next()` (context boş kalır)
2. Bearer var → `verifyAccessToken` + session doldur; geçersiz token **yutulur** (devam eder)

Kullanım: `common` / `web` barrel `use("*", authMiddleware)`; cache prefix için tenant bilgisi gerekir. `public` auth yok.

---

## permission (`permission.ts`)

Session context üzerinde assert — handler başında veya middleware.

| Export                                  | Davranış                                                    | Hata                                       |
| --------------------------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| `assertMember(c)`                       | `user_id` zorunlu; döner                                    | `UNAUTHORIZED`                             |
| `assertOrganization(c)`                 | `organization_id` zorunlu; döner                            | `BAD_REQUEST` (`ORGANIZATION_ID_REQUIRED`) |
| `assertPermission(c, slug)`             | `is_super_admin` bypass; yoksa `permissions.includes(slug)` | `FORBIDDEN`                                |
| `requireMember` / `requireOrganization` | middleware sarmalayıcı                                      | aynı                                       |
| `requirePermission(slug)`               | factory middleware                                          | aynı                                       |

Route handler’larda genelde `assert*` (typed id + erken throw). Middleware zinciri için `require*`.

---

## rate-limit (`rate-limit.ts`)

Redis Lua script: `INCR` + ilk hit’te `PEXPIRE` → `{ current, ttl }`.

### Anahtar üretimi

1. `keyGenerator` verilmişse → sanitize (200 char)
2. Değilse IP:
   - `x-forwarded-for` (ilk hop) veya `x-real-ip`
   - fallback: `getConnInfo(c).remote.address` veya `"unknown"`
3. Prefix: default `rate-limit:`; auth preset → `rate-limit:auth:`

### Yanıt header’ları

| Header                  | Anlam                   |
| ----------------------- | ----------------------- |
| `X-RateLimit-Limit`     | `max_requests`          |
| `X-RateLimit-Remaining` | kalan                   |
| `X-RateLimit-Reset`     | ISO timestamp           |
| `Retry-After`           | limit aşımında (saniye) |

Limit aşımı → `AppError("TOO_MANY_REQUESTS", ...)`.

### Preset’ler (`app_config.rate_limit`)

| Preset                                 | Default                                            | Mount                          |
| -------------------------------------- | -------------------------------------------------- | ------------------------------ |
| `rate_limit.standard`                  | 2000 / 60s                                         | `server/buildServer` — tüm API |
| `rate_limit.auth`                      | 20 / 60s, prefix `rate-limit:auth:`, `force: true` | `apps/auth` uçları             |
| `rate_limit.custom(window, max, msg?)` | özel                                               | route bazlı                    |
| `rate_limit.test`                      | 3 / 10s, `force: true`                             | test                           |

Dev bypass: `NODE_ENV === "development"` && `!TEST_RATE_LIMIT` && `!force` → rate limit atlanır.

Super-admin (`is_super_admin` context) bypass.

Redis hatası → log + istek devam (fail-open).

### `clearRateLimit(ip)`

Test helper: `rate-limit:{sanitizedIp}` DEL.

---

## Mount özeti

```
server/buildServer
  api.use("*", rate_limit.standard)
  mount healthRouter, authRouter
  surfaces: public (auth yok) | common/web (authMiddleware)
  auth routes: rate_limit.auth (+ seçili authMiddleware)
```

Detay: [`server/doc.md`](../server/doc.md)
