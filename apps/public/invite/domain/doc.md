# invite (public) — domain

İndeks: [`apps/public/invite/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynak: `flows.ts`

Authsuz davet önizleme ve kabul. Yönetim tarafı: [`apps/web/invite/domain/doc.md`](../../../web/invite/domain/doc.md).

---

## Zincir

| Endpoint               | Guard | Domain             | Repo                                                         |
| ---------------------- | ----- | ------------------ | ------------------------------------------------------------ |
| `GET /invite/by-token` | —     | `getInviteByToken` | `invite` · `access.findBlocking` · `organization` · `person` |
| `POST /invite/accept`  | —     | `acceptInvite`     | aynı + `user` (+ transaction)                                |

---

## Yardımcılar

### isExpired `flows.ts:13` (iç)

`new Date(invite.expires_at) <= now`.

### resolveAcceptState `flows.ts:17` (iç)

Kabul edilebilir mi? Öncelik sırası:

1. status `accepted` → `can_accept: false`, `INVITE_ALREADY_ACCEPTED`
2. `canceled` → `INVITE_CANCELED`
3. `expired` **veya** `isExpired` → `INVITE_EXPIRED`
4. status `pending` değil → `INVITE_NOT_PENDING`
5. `blocking` (access) varsa → `ACCESS_ALREADY_EXISTS`
6. aksi halde `can_accept: true`, `reason: null`

Hata fırlatmaz; yalnızca durum nesnesi döner (önizleme için).

---

## getInviteByToken `flows.ts:41`

Token ile davet kartı (kabul etmeden).

**Adımlar**

1. `token = trim`; boş → `BAD_REQUEST / INVITE_TOKEN_REQUIRED`.
2. `invite = findByToken` — yok → `NOT_FOUND / INVITE_NOT_FOUND`.
3. Pending **ve** süresi dolmuşsa status’u `EXPIRED` yap (yazılır).
4. `accessRepo.findBlocking({ organizationId, personId, userId })`.
5. Org + person oku (yoksa boş string fallback).
6. `resolveAcceptState` → `can_accept`, `reason`.
7. Dönüş:
   - `invite`: status, email, description, expires_at, accepted_at
   - `organization`: id, company_name
   - `person`: first_name, last_name
   - `scenario`: `invite.user_id` varsa `"existing"`, yoksa `"new"`
   - `can_accept`, `reason`

**Transaction:** yok (expire update tek yazma).

---

## acceptInvite `flows.ts:91`

Daveti kabul eder; access + person bağlar; gerekirse user oluşturur.

**Girdi**

| Alan       | Zorunlu        | Not            |
| ---------- | -------------- | -------------- |
| `token`    | ✓              | trim           |
| `password` | yeni user için | min 8 karakter |

**Adımlar** (tek `db.transaction`, invite satırı `FOR UPDATE`)

1. Token trim; boş → `INVITE_TOKEN_REQUIRED`.
2. Invite’ı `token` + `deleted_at is null` + `forUpdate` ile kilitle — yok → `INVITE_NOT_FOUND`.
3. Status kontrolleri (throw):
   - `accepted` → `CONFLICT / INVITE_ALREADY_ACCEPTED`
   - `canceled` → `BAD_REQUEST / INVITE_CANCELED`
   - `expired` veya süre dolmuş → status EXPIRED yaz + `INVITE_EXPIRED`
   - `pending` değil → `INVITE_NOT_PENDING`
4. Person satırını oku (aktif) — yok → `INVITE_PERSON_NOT_FOUND`.
5. `findBlocking` — varsa → `CONFLICT / ACCESS_ALREADY_EXISTS`.
6. **User çözümleme**
   - `invite.user_id` varsa: user mevcut olmalı; yok → `INVITE_USER_NOT_FOUND`.
   - Yoksa:
     - `person.user_id` dolu → `CONFLICT / PERSON_USER_ALREADY_LINKED`
     - Email normalize; `findIdByEmail` → varsa o user
     - Yoksa: password yok veya 8 karakterden kısa → `INVITE_PASSWORD_REQUIRED`; `createAuthUser` (`active`, `email_verified_at: now()`, person picture → user picture)
7. `access` insert: org, person, user, `role_id = person.role_id`, status `active`, description `"Invite accepted"`.
8. Person update: `user_id`, status `active`, `updated_by_id`; person’da picture yoksa user picture kopyala.
9. Invite update: status `ACCEPTED`, `accepted_at`, `user_id`.
10. Dönüş: `{ access, invite, organization_id, user_id }`.

**Hatalar:** yukarıdaki kodlar.

**Yan etkiler:** `invite`, `access`, `person`, isteğe bağlı `user` yazılır. Session **açılmaz** — client ayrıca sign-in yapar.

**Transaction:** evet (invite kilidi dahil).

⚠ Accept sonrası otomatik oturum yok. ⚠ Person/access FK’ler Prisma’da zayıf — tutarlılık uygulama katmanında.
