# invite (public)

İndeks: [`apps/doc.md`](../../doc.md) · yüzey: [`public/doc.md`](../doc.md)

**Dosyalar:** `invite.schema.ts`, `invite-public.routes.ts`, `domain/`  
**Base path:** `/invite`  
**Mount:** `publicRouter` — **auth yok**  
**Testler:** `invite.integration.test.ts`

---

## Amaç

Davet token'ı ile org bilgisini okuma ve daveti kabul etme. Oturum açılmaz; accept sonrası client sign-in yapmalı.

---

## Endpoint'ler

| Method | Path               | security | tenant | HTTP | code              |
| ------ | ------------------ | -------- | ------ | ---- | ----------------- |
| GET    | `/invite/by-token` | `none`   | `none` | 200  | `invite.by-token` |
| POST   | `/invite/accept`   | `none`   | `none` | 200  | `invite.accept`   |

**Query / body:**

- `by-token`: query `token`
- `accept`: body `token` + opsiyonel `password` (yeni hesap senaryosu, min 8)

**Response (`by-token`):** `invite`, `organization`, `person`, `scenario` (`existing` \| `new`), `can_accept`, `reason`

**Response (`accept`):** `{ organization_id, user_id }` — session/token **verilmez**

---

## Schema özeti

| Schema                 | Alanlar                                                 |
| ---------------------- | ------------------------------------------------------- |
| `InviteByTokenQuery`   | `token`                                                 |
| `InviteAcceptBody`     | `token`, `password?`                                    |
| `InviteByTokenPayload` | invite durumu + org + person + kabul edilebilirlik meta |

---

## Domain

[`domain/doc.md`](./domain/doc.md) — `getInviteByToken`, `acceptInvite` (user/access oluşturma).

---

## Modüller

`invite`, `user`, `access`, `verification_code`, `person`
