# scope

İndeks: [`platform/doc.md`](../doc.md) · Cache: [`core/cache/doc.md`](../../core/cache/doc.md) · Socket: [`core/socket/doc.md`](../../core/socket/doc.md)

Tenant çözümleme, cache prefix ipuçları, socket oda adları ve org-oda yetkisi.

Barrel: `@/platform/scope`

| Dosya          | Rol                                                       |
| -------------- | --------------------------------------------------------- |
| `constants.ts` | Oda prefix’leri, socket event adları, org key listesi     |
| `resolve.ts`   | `resolveScopeId`, `resolveOrganizationId`, `hydrateScope` |
| `rooms.ts`     | `userRoom`, `orgRoom`, `socketRoomBindings` (+ `canJoin`) |

---

## Kurallar

| Kural | Anlam |
| ----- | ----- |
| Tenant vs aktör | Yalnız **tenant** (`organization_id`) istekten çözülür. Aktör (`user_id`) asla body/query’den okunmaz — oturumdan gelir (`assertMember`). |
| Hydrate ≠ yetki | `hydrateScope` context’e org yazar; authorization yerine geçmez. |
| Org oda | Katılım oturumun **aktif** organizasyonuyla sınırlı (süper admin muaf). |

---

## Sabitler (`constants.ts`)

| Sembol | Değer |
| ------ | ----- |
| `SOCKET_ROOM_PREFIX.user` / `.org` | `"user"` / `"org"` |
| `SOCKET_EVENT.joinOrganization` | `"join:organization"` |
| `SOCKET_EVENT.leaveOrganization` | `"leave:organization"` |
| `SCOPE_ORG_KEYS` | `organization_id`, `org_id`, `orgId` (öncelik sırası) |

---

## Çözümleme (`resolve.ts`)

### `resolveScopeId(c, keys)` — öncelik

1. Context (`c.get`)
2. Path param
3. Query
4. Validated JSON body (`c.req.valid("json")`) — henüz validate yoksa atlanır

İlk dolu string kazanır.

### `resolveOrganizationId(c)`

`resolveScopeId(c, SCOPE_ORG_KEYS)`.

### `hydrateScope(c)`

`organization_id` context’te string değilse → istektan çözüp `c.set("organization_id", …)`.

**Ne zaman:** `core/http` cache wrap (`wrapHandler`) hit/miss öncesi — cache key prefix ve socket room türetimi için. Boot’ta `configureRoutePlatform({ hydrateScope })`.

**Ne yapmaz:** `org` tenant middleware’inin `assertOrganization` zorunluluğunu; policy kontrolünü.

---

## Odalar (`rooms.ts`)

| Fonksiyon | Dönüş |
| --------- | ----- |
| `userRoom(userId)` | `user:{userId}` — bağlantıda otomatik join (`index.ts` `room:`) |
| `orgRoom(organizationId)` | `org:{organizationId}` |

### `socketRoomBindings`

Tek binding: join/leave organization event’leri → oda `org:{id}`.

`canJoinOrganization(identity, organizationId)`:

1. `identity.session` (sid) yok → false
2. `getSession(sid)` yok → false
3. `is_super_admin` → true
4. Aksi halde `session.organization_id === organizationId`

Amaç: herkes `join:organization` ile başka org’un `invalidate` trafiğini dinlemesin.

Wiring: kök `index.ts` → `attachSocketServer({ rooms: socketRoomBindings, … })`.

---

## Server scope kaydı ile ilişki

`hydrateScope` ürün anahtarlarını doldurur; **tenant middleware’ler** `server/buildServer` içinde tanımlı:

| Tenant | Middleware özeti | `cacheKey` |
| ------ | ---------------- | ---------- |
| `org` | `assertOrganization` → `org_id` | `org:{id}` |
| `member` | `requireMember` | `user:{userId}` |
| `orgParam` | `requireOrganization` (+ path `id`) | `org:{param\|session}` |
| `none` | no-op | `undefined` (scoped cache yazılmaz) |

Detay: [`server/doc.md`](../../server/doc.md).

---

## Bağımlılık

```
platform/scope → core/socket (tipler), platform/auth (getSession)
server → hydrateScope
index.ts → userRoom + socketRoomBindings
core/http wrapHandler → hydrateScope (boot port)
```
