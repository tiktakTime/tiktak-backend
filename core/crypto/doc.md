# crypto

İndeks: [`core/doc.md`](../doc.md) · Oturum: [`platform/auth/doc.md`](../../platform/auth/doc.md)

Payload-agnostik kripto yardımcıları. Session, claims, org bilmez — yalnızca
imza / özet / rastgele bayt.

Barrel: `@/core/crypto`

| Dosya      | Export                 |
| ---------- | ---------------------- |
| `jwt.ts`   | `signJwt`, `verifyJwt` |
| `hash.ts`     | `sha256`                          |
| `password.ts` | `hashPassword`, `passwordMatches` |
| `token.ts`    | `randomToken`, `newId`            |

---

## `signJwt(payload, ttlSeconds)`

- Algoritma: **HS256**, secret: `JWT_SECRET` (min 16; env)
- `sub` / `jti` varsa jose registered claim olarak set edilir; kalan alanlar
  custom claim
- `iat` + `exp` (`{ttlSeconds}s`)
- Dönüş: sıkıştırılmış JWS string

Ürün access token: `platform/auth.issueAccessToken` → `{ sub, sid, jti }` +
`ACCESS_TOKEN_TTL_SECONDS`.

## `verifyJwt(token)`

- Aynı secret + yalnızca `HS256`
- Süresi dolmuş / bozuk imza → jose hata (yukarı fırlar)
- Dönüş: `JWTPayload` (jose) — ürün claim doğrulaması `platform/auth.verifyAccessToken`

---

## `sha256(input)`

Node `createHash("sha256")` → **hex** string.

Kullanım: refresh token saklama (`refresh:{hash}`), replay karşılaştırması.
Ham refresh Redis’e yazılmaz.

---

## `randomToken(bytes = 32)`

`randomBytes` → **base64url**. Refresh token, e-posta doğrulama token’ı vb.

## `newId()`

`randomUUID()` — session id (`sid`), JWT `jti`, entity id üretimi.

---

## Ne burada değil

| İhtiyaç                | Nerede             |
| ---------------------- | ------------------ |
| Session CRUD / rotate  | `platform/auth`    |
| Bearer header parse    | `core/http/bearer` |
| Password hash (bcrypt) | Bu pakette yok     |

---

## Bağımlılık

```
core/crypto → core/env (JWT_SECRET)
platform/auth → core/crypto
```
