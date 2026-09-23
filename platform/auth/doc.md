# auth

İndeks: [`platform/doc.md`](../doc.md) · Middleware: [`middlewares/doc.md`](../../middlewares/doc.md) · Domain: [`apps/auth/domain/doc.md`](../../apps/auth/domain/doc.md)

TikTak oturum motoru: JWT access + Redis session + refresh rotate. İş kuralı
(kullanıcı/şifre/invite) burada yok — `apps/auth` domain çağırır.

Barrel: `@/platform/auth`

| Dosya                    | Export / rol                                               |
| ------------------------ | ---------------------------------------------------------- |
| `claims.ts`              | `AccessClaims`, `SessionRecord`, `TokenPair`, org/user tip |
| `keys.ts`                | Redis key düzeni                                           |
| `session.ts`             | CRUD / rotate / update / revoke                            |
| `verify.ts`              | `verifyAccessToken`                                        |
| `revoke-organization.ts` | Org bağlam düşürme (logout değil)                          |
| `context.d.ts`           | `AppVariables` RBAC augmentation (runtime import yok)      |

Mekanizma: `@/core/crypto` (JWT/hash/token), `@/core/redis`, `@/core/http` bearer.

---

## Model

### JWT (`AccessClaims`) — kısa ömürlü, ince

| Claim | Kaynak                    | Anlam                 |
| ----- | ------------------------- | --------------------- |
| `sub` | `userId`                  | Kullanıcı id          |
| `sid` | session uuid              | Redis oturum anahtarı |
| `jti` | her access için yeni uuid | Token tekilliği       |

TTL: `ACCESS_TOKEN_TTL_SECONDS` (default 900). Org / permission **JWT’de yok** —
her istekte Redis session’dan okunur.

### Redis `SessionRecord` — uzun ömürlü, zengin

| Alan                                             | Anlam                         |
| ------------------------------------------------ | ----------------------------- |
| `user_id`                                        | Sahip                         |
| `organization_id`                                | Aktif org (null = seçilmemiş) |
| `permissions`                                    | Slug listesi                  |
| `person_id` / `role_id`                          | Org kişi / rol                |
| `is_super_admin`                                 | Policy bypass                 |
| `email` / `first_name` / `last_name` / `picture` | Login snapshot                |
| `refresh_hash`                                   | Ham refresh’in SHA-256        |
| `created_at` / `expires_at`                      | ms epoch                      |

TTL: `REFRESH_TOKEN_TTL_SECONDS` (default 30 gün) — session + refresh key aynı PX.

### `TokenPair` (wire)

`access_token`, `refresh_token`, `token_type: "Bearer"`, `expires_in` (access TTL sn).

---

## Redis anahtarları (`keys.ts`)

| Fonksiyon              | Key                      | Değer                      |
| ---------------------- | ------------------------ | -------------------------- |
| `sessionKey(sid)`      | `session:{sid}`          | JSON `SessionRecord`       |
| `refreshKey(hash)`     | `refresh:{sha256}`       | `sid` string               |
| `userSessionsKey(uid)` | `user_sessions:{userId}` | SET of `sid` (çoklu cihaz) |

`user_sessions` set’i de session TTL ile `PEXPIRE` alır (create sırasında).

---

## Fonksiyonlar (`session.ts`)

### `getSession(sid)`

Redis `GET` + JSON parse. Yok / bozuk JSON → `null`.

### `issueAccessToken({ sub, sid })`

Yeni `jti` + `signJwt` (`HS256`, `JWT_SECRET`). Tek başına session yazmaz.

### `createSession(userId, orgFields?, userSnapshot?)` — adımlar

1. `orgFields` string/null ise `{ organization_id }`’e normalize
2. `sid` = `newId()`, `refresh_token` = `randomToken(32)`, hash = `sha256`
3. `SessionRecord` doldur (org/permission default’ları boş/null/false)
4. Pipeline:
   - `SET session:{sid}` PX
   - `SET refresh:{hash}` → sid PX
   - `SADD user_sessions:{userId}` + `PEXPIRE`
5. `issueAccessToken` → `TokenPair` döndür

Kim çağırır: `apps/auth` `issueSessionForUser` (sign-in, oauth, refresh sonrası).

### `rotateRefreshToken(refreshToken)` — adımlar

1. `sha256(refresh)` → `refresh:{hash}` → sid; yok → `"Invalid refresh token"`
2. Session oku; `refresh_hash` uyuşmazsa → `revokeSession` + `"Refresh token replay or mismatch"`
3. Eski sid’i `revokeSession`
4. Aynı org/permission/snapshot ile **yeni** `createSession`

Amaç: refresh tek kullanımlık; çalınmış token replay’i eski oturumu da düşürür.

### `updateSessionFields(sid, fields)` / `updateSessionOrganization`

Session yok → `"Session not found"`. Kalan TTL (`expires_at - now`) ile `SET` yeniden yazar.
`updateSessionOrganization` yalnızca `organization_id` kısayolu.

Kim: org switch (`apps/auth`), permission hydrate, `revokeOrganizationSessions`.

### `revokeSession(sid)`

Pipeline: session DEL, refresh DEL (hash varsa), `user_sessions` SREM. Access JWT
süresi dolana kadar imza geçerli görünür ama `verifyAccessToken` session bulamaz → reddeder.

---

## `verifyAccessToken` (`verify.ts`)

1. `verifyJwt` (imza + exp)
2. `sub` / `sid` / `jti` zorunlu string
3. `getSession(sid)`; yok veya `user_id !== sub` → hata
4. `{ sub, sid, jti }` döner — org alanları **dönmez**; middleware ayrıca `getSession` okur

Tüketici: `middlewares/auth` + socket `authenticate` (`index.ts`).

---

## `revokeOrganizationSessions(userId, organizationId)`

Logout değil — yalnızca **aktif org’u** bu id olan oturumlarda org bağlamını temizler:

```
organization_id: null, permissions: [], person_id: null, role_id: null
```

`user_sessions` set’indeki her sid için: eşleşmeyen org atlanır; stale sid SREM.
Dönen dizi: temizlenen sid listesi.

Kim: access hard-delete / üyelik düşürme domain’i (kullanıcı başka org’ta kalabilir).

---

## `context.d.ts` — AppVariables

Runtime import yok; tsconfig `include` ile ambient. `middlewares/auth` şunları set eder:

`user_id`, `session_id`, `organization_id`, `org_id` (scope mw), `permissions`,
`person_id`, `role_id`, `is_super_admin`.

---

## Yaşam döngüsü (özet)

```
sign-in / oauth
  → createSession → TokenPair
  → client: Authorization Bearer access

her istek
  → authMiddleware → verifyAccessToken + getSession → context

refresh
  → rotateRefreshToken → eski revoke + yeni pair

org switch
  → updateSessionFields (permissions yeniden)

üyelik silindi
  → revokeOrganizationSessions (org clear)

logout
  → revokeSession
```

---

## Bağımlılık

```
platform/auth → core/crypto, core/redis, core/env
middlewares/auth → platform/auth
apps/auth domain → platform/auth
platform/scope/rooms → getSession (canJoin)
```
