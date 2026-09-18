# cache

İndeks: [`core/doc.md`](../doc.md) · Route: [`http/doc.md`](../http/doc.md) · Scope: [`platform/scope/doc.md`](../../platform/scope/doc.md)

**Dosyalar:** `store.ts` (Redis deposu), `key.ts` (anahtar üretimi), `invalidate.ts` (purge + socket), `index.ts`  
Barrel: `@/core/cache`

Redis key-value deposu **ve** HTTP yanıt önbelleğinin anahtar/invalidation katmanı.

---

## `store.ts` — depo

- TTL’li `get` / `set`
- Surrogate tag set’leri (`setWithTags` / `purgeTags`)
- Prefix ile toplu silme (`invalidateByPrefix`)
- `ENABLE_CACHE` kapalıysa no-op (okuma miss, yazma atlanır)

### TTL sabitleri

`app.config.ts` → `app_config.cache.ttl.*` (ms):

| Sembol        | Kullanım           |
| ------------- | ------------------ |
| `TTL.MISS`    | Negatif / kısa     |
| `TTL.DEFAULT` | Tipik liste / get  |
| `TTL.LONG`    | Nadir değişen veri |

### `CacheStore` yüzeyi

| Metod                                | Davranış                                                |
| ------------------------------------ | ------------------------------------------------------- |
| `get(key)`                           | `cache:{key}` JSON → `{ data }` veya `undefined`        |
| `set(key, { data }, ttl)`            | `SET … PX ttl`                                          |
| `setWithTags(key, value, ttl, tags)` | `set` + her tag için `SADD cache:tag:{tag}` + `PEXPIRE` |
| `purgeTags(tags)`                    | Tag set üyelerini `DEL`, sonra tag key                  |
| `delete(key)`                        | Tek anahtar                                             |
| `invalidateByPrefix(prefix)`         | `SCAN MATCH cache:{prefix}*` + `DEL`                    |
| `keys()`                             | Tüm cache key’leri + `createdAt` (debug)                |

Redis key öneki: `cache:`. Tag öneki: `cache:tag:`.

---

## `key.ts` — anahtar üretimi

`buildCacheKeyFromRoute(route, c)`:

```
[prefix||]substitutedPath[:{queryJson}]
```

- Path `{param}` → gerçek param (sanitized)
- Query: sıralı, her key’in ilk değeri
- `route.prefix` tanımlı ama runtime prefix falsy → **`null`** (scoped miss; global yazılmaz)

Örnek: `org:abc||/employee/search:{"page":"1"}`

`RouteLike` = `{ path, method, prefix? }`. Prefix’i `core/http` scope kaydından
(`ScopeRegistration.cacheKey`) alır — `org:{id}` / `user:{id}`.

---

## `invalidate.ts` — purge + socket

`invalidateKeys(routes, options)`:

| Seçenek          | Anlam                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| `c`              | Hono context (param / query)                                                  |
| `prefixOverride` | Prefix zorla                                                                  |
| `mergeParams`    | Path param birleştir                                                          |
| `redis`          | default `true`; `false` = yalnızca socket FE key (tag purge zaten yapıldıysa) |

Akış:

1. Her route için pattern üret; unresolved scoped → skip (global wipe yok)
2. `redis !== false` → `delete` + `invalidateByPrefix` (query varyantları)
3. `invalidateKey(route, params, keyType)` → FE key dizisi
4. `deriveRooms` → `org:…` / `user:…`
5. Emitter varsa `emit(rooms, queryKeys)`

### Boot

| Fonksiyon                                 | Kim bağlar                                   |
| ----------------------------------------- | -------------------------------------------- |
| `configureCache({ invalidate_key_type })` | `server` — `"react-query"` \| `"unity"`      |
| `setSocketEmitter(fn)`                    | `core/socket` — `(rooms, queryKeys) => void` |

---

## Bağımlılık

```
cache → redis → env
cache → query-keys
http / socket → cache
```

`core/router` import edilmez (cycle yok).

---

## Tüketiciler

| Kim                       | Ne                            |
| ------------------------- | ----------------------------- |
| `core/http` `wrapHandler` | get / setWithTags / tag purge |
| `apps/**/*.routes.ts`     | `TTL.*` sabitleri             |
| `core/socket`             | emitter kaydı                 |
