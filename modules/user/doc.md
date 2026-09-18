# user

İndeks: [`modules/doc.md`](../doc.md) · Kimlik: [`docs/auth-identity.md`](../../docs/auth-identity.md)

**Tablo:** `user`  
**Dosyalar:** `user.prisma`, `enums.prisma`, `user.repo.ts`  
**Tür:** Entity — platform hesabı (kimlik + sık okunan görünüm alanları).

**Soft-delete:** `deleted_at` — okuma sorguları filtreler; `softDelete` yazar.  
**Kardeş bağımlılık:** `create` / `createAuthUser` / `update` / `findById` için [`user_profile`](../user_profile/doc.md) ve [`user_identity`](../user_identity/doc.md) repo’larını çağırır. Cihazlar: [`user_device`](../user_device/doc.md).

---

## Amaç

Platformdaki tek hesap kaydı. Session snapshot, mail, üye kartı gibi **sık okunan** alanlar burada tutulur. Demografi `user_profile`’da; giriş yöntemleri `user_identity`’de; FCM cihazları `user_device`’da.

OAuth-only kullanıcıda `email` null olabilir; doluysa unique.

---

## Alanlar

| Alan                         | Tip          | Null | Açıklama                                                                      |
| ---------------------------- | ------------ | ---- | ----------------------------------------------------------------------------- |
| `id`                         | uuid         | PK   | Hesap kimliği; JWT `sub` ve session `user_id`                                 |
| `system_role_id`             | uuid         | ✓    | Platform-genel sistem rolü (admin vb.); org `role` değil                      |
| `email`                      | varchar(255) | ✓    | Birincil iletişim. Unique (doluysa). OAuth Hide My Email / eksik claim → null |
| `status`                     | `UserStatus` |      | Hesap durumu: `active` / `inactive` / `blocked`                               |
| `first_name`                 | varchar(255) |      | Ad (hot). Session + mail + UI. Default `""`                                   |
| `last_name`                  | varchar(255) |      | Soyad (hot). Aynı kullanım                                                    |
| `display_name`               | varchar(255) | ✓    | Tercih edilen görünen ad; yoksa UI genelde first+last üretir                  |
| `picture`                    | text         | ✓    | Profil görseli URL/path (eski `image` / `avatar_url`)                         |
| `locale`                     | varchar(35)  | ✓    | BCP47 dil tercihi (`tr-TR`, `en-US`). Mail / UI dili                          |
| `timezone`                   | varchar(64)  | ✓    | IANA TZ (`Europe/Istanbul`). Bildirim sessiz saat / tarih formatı             |
| `expires_at`                 | timestamptz  | ✓    | Hesap geçerlilik sonu (abonelik / geçici hesap). Null = süresiz               |
| `email_verified_at`          | timestamptz  | ✓    | E-posta doğrulandığı an. `null` = doğrulanmamış                               |
| `two_factor_enabled_at`      | timestamptz  | ✓    | 2FA açıldığı an. `null` = kapalı                                              |
| `recovery_email`             | varchar(255) | ✓    | Kurtarma e-postası; unique. Şifre unutma alternatif kanalı                    |
| `recovery_email_verified_at` | timestamptz  | ✓    | Kurtarma e-postası doğrulandığı an                                            |
| `last_login_at`              | timestamptz  | ✓    | Son başarılı giriş (password / OAuth)                                         |
| `created_at`                 | timestamptz  |      | Oluşturma                                                                     |
| `updated_at`                 | timestamptz  |      | Son güncelleme                                                                |
| `deleted_at`                 | timestamptz  | ✓    | Soft-delete; doluysa hesap listelerde görünmez                                |

---

## Enum — UserStatus

| Değer      | Anlam                                       |
| ---------- | ------------------------------------------- |
| `active`   | Giriş ve org kullanımı serbest              |
| `inactive` | Kayıt sonrası e-posta doğrulanmamış / pasif |
| `blocked`  | Engellenmiş; auth reddeder                  |

---

## Unique / indeksler

- Unique: `email`, `recovery_email`
- Index: `status`, `system_role_id`

---

## Repo yüzeyi (`user.repo.ts`)

| Fonksiyon                                 | Davranış                                                 |
| ----------------------------------------- | -------------------------------------------------------- |
| `findById`                                | Aktif user + profile merge → `PublicUserRow`             |
| `findAuthByEmail`                         | Auth için ince satır (`id`, `status`, `email`)           |
| `findNameEmailById`                       | Org/person bootstrap: id, email, first/last              |
| `search`                                  | `q` ile isim/email; profile join; sayfalı                |
| `insertUser`                              | Sadece `user` satırı (trx destekli)                      |
| `create`                                  | Admin: user + profile + opsiyonel password identity      |
| `createAuthUser`                          | Sign-up / invite: user + boş profile + password identity |
| `update`                                  | User hot alanları + profile patch + opsiyonel password   |
| `softDelete`                              | `deleted_at` set                                         |
| `findIdByEmail` / `findIdByRecoveryEmail` | Çakışma kontrolü                                         |
| `findAuthProfileByEmail`                  | Forgot-password: id + isim                               |
| `findByVerifiedRecoveryEmail`             | `recovery_email_verified_at IS NOT NULL`                 |
| `markEmailVerified`                       | `email_verified_at = now()`, `status = active`           |
| `updatePassword`                          | Identity upsert + user `updated_at`                      |
| `setRecoveryEmail` / `clearRecoveryEmail` | Kurtarma e-posta + verified_at                           |
| `changeEmail`                             | User email + verified_at; bağlı person email sync        |
| `touchLastLogin`                          | `last_login_at = now()`                                  |

---

## Tüketiciler

| Domain                                                                                                                   | Kullanım                                                |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| [`apps/auth/domain`](../../apps/auth/domain/doc.md)                                                                      | Sign-up, verify, OAuth, session, password, email change |
| [`apps/common/user/domain`](../../apps/common/user/domain/doc.md)                                                        | CRUD / search                                           |
| [`apps/public/invite`](../../apps/public/invite/domain/doc.md), [`apps/web/invite`](../../apps/web/invite/domain/doc.md) | Davet kabulünde user oluştur / bağla                    |
| [`apps/web/person`](../../apps/web/person/domain/doc.md), [`apps/web/employee`](../../apps/web/employee/domain/doc.md)   | İsim/email bootstrap                                    |
| [`apps/common/organization`](../../apps/common/organization/domain/doc.md)                                               | Owner oluşturma                                         |
