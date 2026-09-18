# public

İndeks: [`apps/doc.md`](../doc.md)

**Dosya:** `index.ts` (`publicRouter`)  
**Mount:** `app_config.surfaces.public` — enabled  
**Auth:** **yok** (`authMiddleware` uygulanmaz)

---

## Amaç

Kimlik doğrulama gerektirmeyen uçlar: davet token okuma ve kabul. Auth akışları [`auth/doc.md`](../auth/doc.md) içinde (surfaces dışı).

---

## Slice'lar

| Slice  | Base      | Belge                            |
| ------ | --------- | -------------------------------- |
| invite | `/invite` | [invite/doc.md](./invite/doc.md) |

**Uçlar (özet):**

| Method | Path               | HTTP | code              |
| ------ | ------------------ | ---- | ----------------- |
| GET    | `/invite/by-token` | 200  | `invite.by-token` |
| POST   | `/invite/accept`   | 200  | `invite.accept`   |

---

## Kurallar

- Rate limit: global `rate_limit.standard` (surface özel auth limit yok)
- Kardeş import yasak — slice'lar yalnızca `core/` + `modules/` + kendi `domain/`
- Accept sonrası session açılmaz; client `POST /auth/sign-in` beklenir

---

## İlgili

- Web davet yönetimi: [`web/invite/doc.md`](../web/invite/doc.md)
- Modül: [`modules/invite`](../../modules/invite/doc.md)
