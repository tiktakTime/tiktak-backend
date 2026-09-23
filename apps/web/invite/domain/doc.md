# invite (web) — domain

İndeks: [`apps/web/invite/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynak: `flows.ts`

Org içi davet yönetimi. Kabul: [`apps/public/invite/domain/doc.md`](../../../public/invite/domain/doc.md).

---

## Zincir

| Endpoint                          | Guard          | Domain          | Repo                                                               |
| --------------------------------- | -------------- | --------------- | ------------------------------------------------------------------ |
| `GET /organization/invite/search` | `invite.get`   | `searchInvites` | `invite.search`                                                    |
| `GET /organization/invite/{id}`   | `invite.get`   | `getInvite`     | `invite.findById`                                                  |
| `POST /organization/invite`       | `invite.post`  | `createInvite`  | `person` · `user` · `access` · `invite` · `platform/notifications` |
| `POST .../{id}/resend`            | `invite.post`  | `resendInvite`  | `invite` · `platform/notifications`                                |
| `POST .../{id}/cancel`            | `invite.patch` | `cancelInvite`  | `invite`                                                           |

Hepsi yüzeyde `authMiddleware`; org id session’dan (route).

---

## Yardımcılar

### sendInviteMail `flows.ts:11` (iç)

Person yoksa sessizce return. Aksi halde `sendEmail` key `v2:invite`: isimler, org adı, `buildVerificationLink("/invite/accept", token)`, description, expiresAt.

### resolveInviteTarget `flows.ts:34` (iç)

Davet e-postası ve isteğe bağlı `user_id` üretir.

**Adımlar**

1. `person.user_id` varsa:
   - User yok → `INVITE_LINKED_USER_NOT_FOUND`
   - Person email ≠ user email (normalize) → `PERSON_EMAIL_USER_MISMATCH`
   - Dönüş: `{ inviteEmail: userEmail, inviteUserId: linkedUser.id }`
2. Yoksa:
   - Person email yok → `INVITE_PERSON_EMAIL_MISSING`
   - `findIdByEmail` → varsa id, yoksa `null` (yeni kullanıcı senaryosu)
   - Dönüş: `{ inviteEmail, inviteUserId }`

---

## createInvite `flows.ts:60`

**Girdi:** `organizationId`, `actorUserId`, `personId`, `description?`, `expiresAt?`

**Adımlar**

1. Person yok → `INVITE_PERSON_NOT_FOUND`.
2. `resolveInviteTarget(person)`.
3. `findBlocking` (org + person + user) → varsa `INVITE_ACCESS_EXISTS`.
4. `findPendingByPerson` → varsa `INVITE_PENDING_EXISTS`.
5. `generateUniqueToken()`; `expiresAt` girdiden veya `computeExpiry()` (TTL gün: `INVITE_TTL_DAYS`).
6. `insert` — status pending varsayılan repo’da; `created_by_id = actor`.
7. `sendInviteMail` — hata yakalanır, **loglanır, create yine başarılı** (⚠ mail kaybı mümkün).
8. Dönüş: created invite.

**Transaction:** yok.

---

## resendInvite `flows.ts:109`

**Adımlar**

1. Invite yok → `INVITE_NOT_FOUND`.
2. Status `pending` değil → `INVITE_NOT_PENDING`.
3. Yeni token + `computeExpiry()`; `accept_attempts=0`, `last_attempt_at/locked_until=null`, `updated_by_id`.
4. Update yoksa `INVITE_NOT_FOUND`.
5. Mail (hata yutulur).

---

## cancelInvite `flows.ts:141`

Pending değilse `INVITE_NOT_PENDING`. Status `CANCELED`, `canceled_at=now`.

---

## getInvite `flows.ts:162`

`findById` — yoksa `INVITE_NOT_FOUND`.

---

## searchInvites `flows.ts:168`

`repo.search(organizationId, { page, limit, status? })` — delege.
