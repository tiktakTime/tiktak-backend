# invite

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `invite`  
**Dosyalar:** `invite.prisma`, `enums.prisma`, `invite.repo.ts`, `constants.ts`  
**Tür:** Entity — org daveti (e-posta + token).

**Soft-delete:** `deleted_at` kolonu var; tüm okuma sorguları `deleted_at IS NULL` filtreler. Ayrı soft-delete helper yok — domain gerekirse `updateById` ile yönetir.

---

## Amaç

Yönetici bir `person` için davet oluşturur; public token ile kabul edilir. Kabulde `access` + `user`/`person` bağları kurulur.

---

## Alanlar

| Alan                                  | Tip            | Null   | Açıklama                                   |
| ------------------------------------- | -------------- | ------ | ------------------------------------------ |
| `id`                                  | uuid           | PK     |                                            |
| `organization_id`                     | uuid           |        | Kiracı                                     |
| `user_id`                             | uuid           | ✓      | Bilinen hesap (mevcut kullanıcı senaryosu) |
| `person_id`                           | uuid           |        | Davet edilen kişi                          |
| `email`                               | varchar(255)   |        | Davet e-postası                            |
| `token`                               | varchar(128)   | unique | Public token                               |
| `status`                              | `InviteStatus` |        | Yaşam döngüsü                              |
| `description`                         | text           | ✓      | Not (mail'e gider)                         |
| `expires_at`                          | timestamptz    |        | Son geçerlilik                             |
| `accepted_at` / `canceled_at`         | timestamptz    | ✓      |                                            |
| `accept_attempts`                     | int            |        | Deneme sayacı                              |
| `last_attempt_at` / `locked_until`    | timestamptz    | ✓      | Brute-force kilidi                         |
| `*_by_id` / timestamps / `deleted_at` |                |        | Soft-delete kolonu                         |

---

## Enum — InviteStatus

`pending`, `accepted`, `expired`, `canceled`

---

## Sabitler (`constants.ts`)

| Sabit             | Değer                                         | Açıklama                              |
| ----------------- | --------------------------------------------- | ------------------------------------- |
| `INVITE_STATUS.*` | Enum string mirror (`PENDING`, `ACCEPTED`, …) | Repo status yazımı                    |
| `INVITE_TTL_DAYS` | `7`                                           | `computeExpiry` varsayılan gün sayısı |

---

## İndeksler

`organization_id`, `user_id`, `person_id`, `status`, `expires_at`, `locked_until`; unique `token`.

---

## Repo yüzeyi (`invite.repo.ts`)

| Fonksiyon             | Davranış                                                   | Parametreler                                               | Hata / not                          |
| --------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------- |
| `generateInviteToken` | `uuid + randomBytes(16 hex)`                               | —                                                          | Senkron; çakışma kontrolü yok       |
| `computeExpiry`       | `now + days * 24h`                                         | `days` (default `INVITE_TTL_DAYS`)                         |                                     |
| `tokenExists`         | Token DB'de var mı                                         | `token`                                                    | Silinmiş dahil kontrol              |
| `generateUniqueToken` | En fazla 5 deneme unique token                             | —                                                          | Son çare yine `generateInviteToken` |
| `findById`            | Org kapsamında aktif davet                                 | `orgId`, `id`                                              | `deleted_at IS NULL`                |
| `findByToken`         | Token ile global arama (public accept)                     | `token`                                                    |                                     |
| `findPendingByPerson` | Person için bekleyen davet                                 | `orgId`, `personId`                                        | `status = pending`                  |
| `insert`              | Yeni davet; `status: pending`                              | org, person, user, email, token, expires_at, created_by_id |                                     |
| `updateById`          | Kısmi patch (token yenileme, status, brute-force alanları) | `id`, patch, opsiyonel `trx`                               |                                     |
| `search`              | Org davet listesi                                          | `orgId`, `{ page, limit, status? }`                        | Sayfalı                             |

---

## Tüketiciler

| Domain                                                                | Dosyalar   | Kullanım                                                                                       |
| --------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| [`apps/web/invite/domain`](../../apps/web/invite/domain/doc.md)       | `flows.ts` | Oluştur, yeniden gönder, iptal, liste; `generateUniqueToken`, `computeExpiry`, `INVITE_STATUS` |
| [`apps/public/invite/domain`](../../apps/public/invite/domain/doc.md) | `flows.ts` | `findByToken`, accept akışı; `accessRepo.findBlocking`, `accessRepo.insert`                    |

İlgili modüller: [`person`](../person/doc.md), [`access`](../access/doc.md), [`user`](../user/doc.md), [`organization`](../organization/doc.md).
