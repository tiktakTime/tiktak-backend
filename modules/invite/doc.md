# invite

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `invite`  
**Dosyalar:** `invite.prisma`, `enums.prisma`  
**Tür:** Entity — organizasyon daveti. Repo yok.

**Soft-delete:** `deleted_at`. Okuma filtresi henüz yok.  
**Bağımlılık:** `user_id` doluysa `user.id`, `onDelete: SetNull`. `organization_id` ve `person_id` düz uuid. Bu iki model henüz yok. `created_by_id`, `updated_by_id`, `deleted_by_id` düz uuid.

Kaynak: humans `src/v2/module/organization/invite/model.js`. Token bu satırdadır. `user_verification` içine kopyalanmaz.

---

## Amaç

Bir kişiye organizasyon daveti. Linkteki anahtar `token` kolonudur. Kabul, hesap yoksa `user` ve `user_identity` yazar. Hesap varsa onu bağlar. Doğrulanmamış hesabı bu kabul doğrulanmış sayar. İkinci bir doğrulama maili açılmaz.

Gönderme, yeniden gönderme, arama ve iptal oturumlu `common` yüzeyindedir. `GET /invite/by-token` ve `POST /invite/accept` oturumsuz `public` yüzeyindedir.

---

## Alanlar

| Alan              | Tip            | Null | Açıklama                                                                                          |
| ----------------- | -------------- | ---- | ------------------------------------------------------------------------------------------------- |
| `id`              | uuid           | PK   | Davet kimliği. UUID v4, otomatik.                                                                 |
| `organization_id` | uuid           |      | Davetin organizasyonu. Index'li. Relation yok.                                                    |
| `person_id`       | uuid           |      | Davet edilen kişi kaydı. Index'li. Relation yok.                                                  |
| `user_id`         | uuid           | ✓    | Davet edilen hesap. Yoksa kabul sırasında dolar. `onDelete: SetNull`. Index'li.                  |
| `email`           | varchar(255)   |      | Davet anındaki adres. Kayıtta trim ve küçük harf.                                                 |
| `token`           | varchar(128)   |      | Link anahtarı. Unique. UUID artı 16 bayt. Düz metin.                                              |
| `status`          | `InviteStatus` |      | `pending`, `accepted`, `expired`, `canceled`. Varsayılan `pending`. Index'li.                     |
| `description`     | text           | ✓    | Açıklama. Kayıtta trim.                                                                           |
| `expires_at`      | timestamptz    |      | Geçerlilik bitişi. Humans'ta 7 gün. Index'li.                                                     |
| `accepted_at`     | timestamptz    | ✓    | Kabul zamanı.                                                                                     |
| `canceled_at`     | timestamptz    | ✓    | İptal zamanı.                                                                                     |
| `accept_attempts` | int            |      | Kabul denemesi. Varsayılan `0`. Yeniden gönderimde sıfırlanır.                                    |
| `last_attempt_at` | timestamptz    | ✓    | Son kabul denemesi.                                                                               |
| `locked_until`    | timestamptz    | ✓    | Bu ana kadar kabul kilitli. Index'li.                                                             |
| `created_by_id`   | uuid           | ✓    | Daveti açan hesap. Relation yok.                                                                  |
| `updated_by_id`   | uuid           | ✓    | Son güncelleyen. Relation yok.                                                                    |
| `deleted_by_id`   | uuid           | ✓    | Silen. Relation yok.                                                                              |
| `created_at`      | timestamptz    |      | Oluşturma.                                                                                        |
| `updated_at`      | timestamptz    |      | Son güncelleme.                                                                                   |
| `deleted_at`      | timestamptz    | ✓    | Doluysa soft-delete.                                                                              |

`user` kolon değildir.

---

## Enum — InviteStatus

| Değer      | Anlam                          |
| ---------- | ------------------------------ |
| `pending`  | Bekliyor. Varsayılan.          |
| `accepted` | Kabul edildi.                  |
| `expired`  | Süresi doldu.                  |
| `canceled` | İptal edildi. Red statüsü yok. |

---

## Unique ve indeksler

- Unique: `token` (`idx_invite_token_unique`)
- Index: `organization_id`, `person_id`, `user_id`, `status`, `expires_at`, `locked_until`

---

## Yalnızca SQL

- CHECK, trigger ve extension yok.
- Kabul kilidi uygulama kuralıdır: 5 deneme, 1 saat pencere, 24 saat kilit. Humans'ta kolon vardır, accept ucu sayacı artırmaz. Bu kopyada artırılacak. Şema sayacı kendisi yürütmez.

---

## Alan notu

- Public uçlar `rate_limit.invite` altındadır: IP başına 20 istek / 60 saniye, prefix `rate-limit:invite:`. Giriş limiti ile sayaç paylaşılmaz.
- Kabul yeni hesap açarsa `user.status = active`, `is_email_verified = true` ve `user_identity.provider = email` olur. Şifre identity satırına yazılır.
- Var olan ve doğrulanmamış hesap kabulde doğrulanmış sayılır.
- Süper admin davet uçları `apps/admin` altında durur. Bu tabloyu kullanırlar, ayrı bir model değildir.
