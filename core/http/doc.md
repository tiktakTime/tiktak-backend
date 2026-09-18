# http

İndeks: [`core/doc.md`](../doc.md) · Hatalar: [`errors/doc.md`](../errors/doc.md) · Sözleşme: [`docs/api-standards.md`](../../docs/api-standards.md) · Cache: [`cache/doc.md`](../cache/doc.md) · i18n içerik: [`platform/i18n/doc.md`](../../platform/i18n/doc.md)

Barrel: `@/core/http`

HTTP sözleşmesi: route tanımı → OpenAPI derleme → handler sarma (cache/purge) →
tek render hunisi. Ürün scope/policy **port** ile gelir (`configureRoutePlatform`).

---

## Dosyalar

| Dosya              | Sorumluluk                                                       |
| ------------------ | ---------------------------------------------------------------- |
| `platform.ts`      | Port: `configureRoutePlatform`, `scopeFor`, `tenantId`/`actorId` |
| `define.ts`        | `RouteDef`, `RouteCtx`, `defineRoute` (tip çıkarımı)             |
| `compile.ts`       | `RouteDef` → zod-openapi + scope/policy middleware               |
| `slice.ts`         | Cache wrap, `createSlice`                                        |
| `tags.ts`          | Tag kaydı, `qualifyTags`, purge → ilgili route’lar               |
| `response-spec.ts` | `Result` / `Page` / `Failure` OpenAPI                            |
| `result.ts`        | `ok(code, data)` named success                                   |
| `render.ts`        | `renderSuccess` / headers                                        |
| `i18n.ts`          | Bundle boot, locale, mutation success key assert                 |
| `catalog.ts`       | Tip registry (ürün augmentation)                                 |
| `error-handler.ts` | Global hata → RFC 9457 tarzı zarf                                |
| `paginate.ts`      | `toPage` / `paginate`                                            |
| `bearer.ts`        | `extractBearerToken`                                             |

---

## Boot portları

### `configureI18n({ bundles, defaultLocale, errorMeta })`

`server/buildServer` — katalog + status meta. Detay: [`platform/i18n`](../../platform/i18n/doc.md).

### `configureRoutePlatform(config)`

| Alan | Amaç |
| ---- | ---- |
| `scopes` | `tenant` adı → `{ middleware, cacheKey }` |
| `checkPolicy` | `policy: string[]` AND izin kontrolü |
| `hydrateScope` | Cache öncesi context’e org yaz |
| `resolveTenantId` / `resolveActorId` | `RouteCtx.tenantId` / `actorId` |

Slice’lar modül yüklenirken `createSlice` çağırır; platform **istek anında**
`requirePlatform()` ile okunur (boot sırası: önce `buildServer`).

Bilinmeyen `tenant` → throw (`Unknown route tenant …`).

Gerçek wiring: [`server/doc.md`](../../server/doc.md) (`org` / `member` / `orgParam` / `none`).

---

## `defineRoute` — ne tanımlar?

| Alan | Default | Anlam |
| ---- | ------- | ----- |
| `name` | — | Global benzersiz + success katalog anahtarı |
| `method` / `path` | — | HTTP |
| `security` | `"bearer"` | OpenAPI security; `"none"` public |
| `tenant` | `"none"` | Scope middleware + cache prefix kuralı |
| `policy` | — | AND slug listesi → `checkPolicy` |
| `request` | — | Zod params/query/body |
| `response` | — | `Result` / `Page` / … |
| `cache.read` | — | `{ ttl, tags? }` — GET önbellek |
| `cache.write.purge` | — | Mutation sonrası tag purge |
| `handle(ctx)` | — | Domain; `Response` veya data / `ok()` |

`RouteCtx`: `params`, `query`, `body` (lazy `req.valid`), `tenantId`, `actorId`, `c`.

`defineRoute` runtime’da no-op kimlik — sadece tip çıkarımı.

---

## `createSlice(defs)` — derleme zinciri

Her `def` için:

1. `name` global Set — duplicate → throw
2. `method !== "get"` → `registerMutationSuccessKey(name)` (success.json zorunlu)
3. `compileRouteDef`:
   - scope middleware (`scopeFor(tenant).middleware`)
   - varsa policy middleware
   - OpenAPI request/response (200 + tüm `ERROR_CODES` Failure)
   - security bearer şeması
4. `wrapHandler` + `dataHandler` → `app.openapiRoutes`

### Handler / yanıt

`handle` sonucu:

| Sonuç | Wire |
| ----- | ---- |
| `Response` | olduğu gibi |
| `page` mode | JSON olduğu gibi (zarf domain’de) |
| `ok(code, data)` / named success | `renderSuccess` |
| düz data | `renderSuccess` ile `code: def.name` |

---

## Cache wrap (`wrapHandler`) — adımlar

Cache `ttl` veya `purge` yoksa sarma yok (düz handler).

Aksi halde her istekte:

1. `hydrateScope?.(c)`
2. `ttl` varsa `readCached`:
   - key = `buildCacheKeyFromRoute` (prefix = `scope.cacheKey`)
   - key yok + tenant `required` → throw; değilse miss
   - hit → cached JSON Response
3. Handler çalıştır; status ≥ 300 → cache yazma/purge yok
4. Tekrar hydrate; `writeCached` (tags varsa `setWithTags` + qualify)
5. `schedulePurge` fire-and-forget: tag DEL + `invalidateKeys(…, { redis: false })` → socket FE keys

Tenant cache politikası (`app_config.cache.scopes`): `allowed` / `required`.
`none` genelde scoped key üretmez → global cache yazılmaz.

Detay anahtar/tag: [`cache/doc.md`](../cache/doc.md).

---

## Public yardımcılar

| Sembol | Rol |
| ------ | --- |
| `Result` / `Page` / `Failure` | OpenAPI yanıt spec |
| `tenantId` / `actorId` | Context üzerinden ürün çözücü |
| `extractBearerToken` | `Authorization: Bearer …` |
| `renderSuccess` / `renderError` / `renderValidation` | Tek huni |
| `ok(code, data)` | Domain success override |
| `toPage` / `paginate` | Liste zarfı |
| `negotiateLocale` / `interpolate` | Accept-Language + `{param}` |

---

## Bağımlılık

```
http → cache, router, errors, env (dolaylı)
server → configureI18n + configureRoutePlatform
apps/**/*.routes → defineRoute + createSlice
platform ↛ http implementasyonu (yalnız içerik / hydrate port)
```
