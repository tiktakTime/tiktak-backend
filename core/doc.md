# Core

Motor katmanı: TikTak domain’i olmadan taşınabilir altyapı. Mantıken **tek npm paketi**; klasörler araçlardır (birbirini import edebilir, **döngü yok**).

| Referans | Konum                                             |
| -------- | ------------------------------------------------- |
| Mimari   | [`docs/architecture.md`](../docs/architecture.md) |
| Kararlar | [`app.config.ts`](../app.config.ts)               |
| Secret   | [`env/doc.md`](./env/doc.md)                      |
| Platform | [`platform/doc.md`](../platform/doc.md)           |

---

## Kurallar

| Kural         | Anlam                                                    |
| ------------- | -------------------------------------------------------- |
| Domain yok    | Entity / use-case yok                                    |
| Yukarı bakmaz | `core` ↛ `apps` / `modules` / `middlewares` / `platform` |
| İç import     | Serbest; **ADP** (döngü yok)                             |
| Kardeş yasağı | Yalnızca `apps`                                          |

---

## Araçlar

| Klasör                      | Rol                                                                  |
| --------------------------- | -------------------------------------------------------------------- |
| [router](./router/)         | `createApp` / `createRouter` + `AppVariables` (`trace_id`, `locale`) |
| [errors](./errors/)         | `AppError`, `ERROR_CODES`, handler re-export                         |
| [http](./http/)             | route / zarf / i18n motoru / render / bearer / validation            |
| [fields](./fields/)         | IdParam, DateOnly, IsoInstant, `normalizeEmail`                      |
| [env](./env/)               | Doğrulanmış process env                                              |
| [database](./database/)     | Kysely pool                                                          |
| [crypto](./crypto/)         | `signJwt` / `verifyJwt` / `sha256` / random (payload-agnostik)       |
| [redis](./redis/)           | ioredis singleton                                                    |
| [cache](./cache/)           | Redis depo + `TTL` + yanıt cache anahtarı + invalidation             |
| [queue](./queue/)           | BullMQ + generic enqueue                                             |
| [query-keys](./query-keys/) | FE invalidate key stratejileri                                       |
| [socket](./socket/)         | Socket.IO (authenticate/rooms port)                                  |
| [files](./files/)           | S3 + upload validate + sharp/HEIC (limitler `app.config`)            |

---

## DAG özeti

```
http → cache → redis → env
http → router, query-keys, errors/errors (ERROR_CODES), app.config
router → http/error-handler (validation / AppError / 404)
http/error-handler → catalog, result, router/types, env
queue → redis
files → env, app.config
socket → http/bearer, cache
crypto → env
```

Handler’lar `core/http/error-handler.ts` içinde; `@/core/errors` yalnızca re-export eder.

---

## Boot

[`server/buildServer`](../server/doc.md) — `configureI18n` → `configureRoutePlatform` → `configureCache`, sonra mount.  
[`index.ts`](../index.ts) — listen + socket.
