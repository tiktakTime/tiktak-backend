# user

İndeks: [`modules/doc.md`](../doc.md)

**Tablolar:** `user`, `user_identity`, `user_device`, `user_verification`, `user_detail`, `user_log`  
**Dosyalar:** `user.prisma`, `user-identity.prisma`, `user-device.prisma`, `user-verification.prisma`, `user-detail.prisma`, `user-log.prisma`, `enums.prisma`, `repo.ts`, `normalize.ts`  
**Tür:** Entity — platform hesabı ve ona bağlı giriş, cihaz, doğrulama, detay, log. Repo satır okur ve yazar. Karar `apps/auth` içindedir.

**Soft-delete:** Yalnızca `user.deleted_at`. Alt tablolarda `deleted_at` yok. Okuma filtresi henüz yok.  
**Bağımlılık:** `user_identity`, `user_device`, `user_verification` ve `user_detail` `user`'a `@relation`, `onDelete: Cascade`. Oturum ayrı tablo değildir; `user_device.token_hash` üzerindedir. `user_log` bağlanmaz; kolonlar düz uuid'dir. `invite.user_id` bu modele `onDelete: SetNull` ile bağlanır. `system_role_id`, `country_id`, `nationality_id` düz uuid'dir, `@relation` yoktur.

Kaynak: humans `src/v2/module/user/model.js` tek tabloydu. Bu kopya o tabloyu böler. Humans CREATE'i numaralı migration'larda yok; sonradan eklenen kolonlar 052, 053 ve 060'taydı.

---

## Amaç

Hesap `user` tablosundadır. Google, Apple ve e-posta girişi `user_identity` satırlarıdır. Her kurulum `user_device` olur ve açık oturum o satırdaki token'dır. Tek kullanımlık kodlar `user_verification` içindedir. Kişisel ve personel bilgisi `user_detail` içindedir. Olay geçmişi `user_log` içindedir ve yalnızca eklenir.

---

## user

Girişte gereken kimlik ve doğrulama bayrakları. Şifre burada durmaz.

| Alan                         | Tip          | Null | Açıklama                                                                                              |
| ---------------------------- | ------------ | ---- | ----------------------------------------------------------------------------------------------------- |
| `id`                         | uuid         | PK   | Hesap kimliği. UUID v4, otomatik.                                                                     |
| `system_role_id`             | uuid         | ✓    | Platform rolü. Humans migration 053 `role.id`. Index'li. Relation yok.                                |
| `first_name`                 | varchar(255) |      | Ad. Zorunlu, 1–255. Kayıtta trim.                                                                     |
| `last_name`                  | varchar(255) |      | Soyad. Zorunlu, 1–255. Kayıtta trim.                                                                  |
| `full_name`                  | varchar(511) |      | Ad ve soyad. Domain yazar: trim edilmiş ad, bir boşluk, trim edilmiş soyad. Şema ve veritabanı türetmez. |
| `email`                      | varchar(255) |      | Hesap e-postası. Unique. Kayıtta trim ve küçük harf.                                                  |
| `image`                      | text         | ✓    | Profil resmi URL'i. Google `picture` buraya yazılır. Apple fotoğraf göndermez.                        |
| `phone_mobile`               | varchar(50)  | ✓    | Cep telefonu. Unique. En çok 50. Kayıtta trim.                                                        |
| `recovery_email`             | varchar(255) | ✓    | Kurtarma e-postası. Doğrulama sonrası dolar. Boş kayıt null olur. Doluysa trim ve küçük harf. Unique. |
| `is_recovery_email_verified` | boolean      |      | Kurtarma e-postası doğrulandı mı. Varsayılan `false`.                                                 |
| `is_email_verified`          | boolean      |      | E-posta doğrulandı mı. Varsayılan `false`.                                                            |
| `is_phone_verified`          | boolean      |      | Telefon doğrulandı mı. Varsayılan `false`.                                                            |
| `is_two_factor_enabled`      | boolean      |      | İki adımlı doğrulama açık mı. Varsayılan `false`.                                                     |
| `status`                     | `UserStatus` |      | `active`, `inactive`, `blocked`. Varsayılan `active`. Index'li.                                       |
| `expired_date`               | timestamptz  | ✓    | Bu andan sonra hesap pasif sayılır.                                                                   |
| `last_login_at`              | timestamptz  | ✓    | Son giriş.                                                                                            |
| `created_at`                 | timestamptz  |      | Oluşturma.                                                                                            |
| `updated_at`                 | timestamptz  |      | Son güncelleme.                                                                                       |
| `deleted_at`                 | timestamptz  | ✓    | Doluysa soft-delete.                                                                                  |

İlişki alanları kolon değildir: `identities`, `devices`, `verifications`, `detail`, `invites`.

---

## user_identity

Bir hesabın bir giriş yöntemi. Sağlayıcı ve `subject` çifti tekildir. Aynı hesapta aynı sağlayıcıdan bir satır vardır. Ad, soyad ve fotoğraf burada durmaz. `user` tablosuna yazılır.

| Alan                      | Tip                | Null | Açıklama                                                                                                                                          |
| ------------------------- | ------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                      | uuid               | PK   | Kimlik satırı. UUID v4, otomatik.                                                                                                                 |
| `user_id`                 | uuid               | FK   | `user.id`. `onDelete: Cascade`.                                                                                                                   |
| `provider`                | `UserAuthProvider` |      | `email`, `google`, `apple`.                                                                                                                       |
| `subject`                 | varchar(255)       |      | Google ve Apple `sub`. E-posta için küçük harfe çevrilmiş adres. `(provider, subject)` unique.                                                    |
| `email`                   | varchar(255)       | ✓    | Sağlayıcının bildirdiği adres. Hesap e-postasından farklı olabilir. Apple gizli yönlendirme adresi olabilir.                                      |
| `email_verified`          | boolean            |      | Sağlayıcı adresi doğrulanmış sayıyor mu. Varsayılan `false`.                                                                                      |
| `private_email`           | boolean            |      | Apple `is_private_email`. Varsayılan `false`.                                                                                                     |
| `password`                | varchar(255)       | ✓    | Hash. Yalnızca `provider = email`. Model hash üretmez. Şemada CHECK yok.                                                                         |
| `last_password_change_at` | timestamptz        | ✓    | Son şifre değişikliği. E-posta satırında durur.                                                                                                   |
| `refresh_token`           | text               | ✓    | Apple refresh token. Hesap silinirken Apple tarafında iptal için tutulur. Düz metin tutulmaz; şifreleme uygulama katmanındadır. Şemada CHECK yok. |
| `last_used_at`            | timestamptz        | ✓    | Bu yöntemle son giriş.                                                                                                                            |
| `created_at`              | timestamptz        |      | Oluşturma.                                                                                                                                        |
| `updated_at`              | timestamptz        |      | Son güncelleme.                                                                                                                                   |

---

## user_device

Kurulum başına bir cihaz. Açık oturum bu satırdadır. Eski `notification_key` ve `notification_key_web` burada `push_token` olur.

| Alan              | Tip              | Null | Açıklama                                                                                          |
| ----------------- | ---------------- | ---- | ------------------------------------------------------------------------------------------------- |
| `id`              | uuid             | PK   | Cihaz kimliği. UUID v4, otomatik.                                                                 |
| `user_id`         | uuid             | FK   | `user.id`. `onDelete: Cascade`.                                                                   |
| `installation_id` | varchar(255)     |      | İstemcinin ilk açılışta ürettiği kalıcı kimlik. `(user_id, installation_id)` unique.              |
| `platform`        | `DevicePlatform` |      | `ios`, `android`, `web`.                                                                          |
| `name`            | varchar(255)     | ✓    | Cihaz adı.                                                                                        |
| `model`           | varchar(255)     | ✓    | Model.                                                                                            |
| `os_version`      | varchar(50)      | ✓    | İşletim sistemi sürümü.                                                                           |
| `app_version`     | varchar(50)      | ✓    | Uygulama sürümü.                                                                                  |
| `locale`          | varchar(20)      | ✓    | Dil ve bölge.                                                                                     |
| `timezone`        | varchar(64)      | ✓    | Saat dilimi.                                                                                      |
| `push_token`      | text             | ✓    | Bildirim anahtarı. Unique. Boş kayıtlar birden fazla null olabilir.                               |
| `push_provider`   | `PushProvider`   | ✓    | `fcm`, `apns`, `web_push`. Token varken dolar.                                                    |
| `token_hash`      | varchar(255)     | ✓    | Bu kurulumun refresh token hash'i. Unique. Düz token yazılmaz. Boşsa oturum yoktur.                          |
| `expires_at`      | timestamptz      | ✓    | Token bitişi. Oturum yokken boş.                                                                              |
| `last_seen_at`    | timestamptz      | ✓    | Son görülme.                                                                                      |
| `last_ip`         | inet             | ✓    | Son IP.                                                                                           |
| `revoked_at`      | timestamptz      | ✓    | Doluysa cihaz kapatılmıştır. Satır silinmez. Aynı token ikinci kez gelirse bu alan dolar, `token_hash` boşalır. |
| `created_at`      | timestamptz      |      | Oluşturma.                                                                                        |
| `updated_at`      | timestamptz      |      | Son güncelleme.                                                                                   |

---

## user_verification

E-posta doğrulama, kurtarma e-postası, telefon ve şifre sıfırlama kodu. Kodun kendisi tutulmaz.

| Alan            | Tip                | Null | Açıklama                                                      |
| --------------- | ------------------ | ---- | ------------------------------------------------------------- |
| `id`            | uuid               | PK   | Kayıt kimliği. UUID v4, otomatik.                             |
| `user_id`       | uuid               | FK   | `user.id`. `onDelete: Cascade`. `(user_id, type)` index'li.   |
| `type`          | `VerificationType` |      | `email_verify`, `recovery_email_verify`, `phone_verify`, `password_reset`, `email_change`. |
| `target`        | varchar(255)       |      | Doğrulanan e-posta veya telefon.                              |
| `token_hash`    | varchar(255)       |      | Kodun hash'i. Unique. Düz kod yazılmaz.                       |
| `attempt_count` | int                |      | Yanlış deneme sayısı. Varsayılan `0`.                         |
| `expires_at`    | timestamptz        |      | Kodun bitişi.                                                 |
| `consumed_at`   | timestamptz        | ✓    | Doluysa kod kullanılmıştır.                                   |
| `created_at`    | timestamptz        |      | Oluşturma. `updated_at` yok.                                  |

---

## user_detail

Hesaba bire bir kişisel ve personel bilgisi. Satır, detay ilk kez yazıldığında oluşur.

| Alan                          | Tip          | Null | Açıklama                                                                                                                                          |
| ----------------------------- | ------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user_id`                     | uuid         | PK, FK | `user.id`. `onDelete: Cascade`.                                                                                                               |
| `country_id`                  | uuid         | ✓    | Bulunduğu ülke. Humans'ta `country.id`. Index'li. Relation yok.                                                                                   |
| `nationality_id`              | uuid         | ✓    | Uyruk. Humans'ta `country.id`. Index'li. Relation yok.                                                                                            |
| `gender`                      | `UserGender` |      | `female`, `male`, `other`, `none`. Varsayılan `none`. `other` bilinçli seçimdir. `none` seçilmemiş demektir; arayüzde seçenek olarak gösterilmez. |
| `birth_location`              | varchar(255) | ✓    | Doğum yeri. En çok 255. Kayıtta trim.                                                                                                             |
| `birthdate`                   | date         | ✓    | Doğum günü. Saat ve saat dilimi yok.                                                                                                              |
| `phone_landline`              | varchar(15)  | ✓    | Sabit telefon. Unique. En çok 15. Kayıtta trim.                                                                                                   |
| `driver_license_no`           | varchar(255) | ✓    | Ehliyet numarası. Kayıtta trim.                                                                                                                   |
| `driver_license_type`         | varchar(255) | ✓    | Ehliyet tipi. Kayıtta trim.                                                                                                                       |
| `driver_license_organization` | varchar(255) | ✓    | Ehliyeti veren kurum. Kayıtta trim.                                                                                                               |
| `insurance_company`           | varchar(255) | ✓    | Sigorta şirketi. Kayıtta trim.                                                                                                                    |
| `insurance_no`                | varchar(255) | ✓    | Sigorta numarası. Kayıtta trim.                                                                                                                   |
| `insurance_class`             | varchar(255) | ✓    | Sigorta sınıfı. Kayıtta trim.                                                                                                                     |
| `tax_no`                      | varchar(255) | ✓    | Vergi numarası. Kayıtta trim.                                                                                                                     |
| `tax_id`                      | varchar(255) | ✓    | Vergi kimlik numarası. Kayıtta trim.                                                                                                              |
| `tax_class`                   | varchar(255) | ✓    | Vergi sınıfı. Anahtar `{index}_{slug}`, örnek `0_employees_residing_abroad`. Enum değil. Kayıtta trim.                                            |
| `child_exempt_amount`         | varchar(255) | ✓    | Çocuk muafiyet tutarı. Kayıtta trim.                                                                                                              |
| `health_insurance`            | varchar(255) | ✓    | Sağlık sigortası. Kayıtta trim.                                                                                                                   |
| `social_health_no`            | varchar(255) | ✓    | Sosyal güvenlik numarası. Kayıtta trim.                                                                                                           |
| `created_at`                  | timestamptz  |      | Oluşturma.                                                                                                                                        |
| `updated_at`                  | timestamptz  |      | Son güncelleme.                                                                                                                                   |

---

## user_log

Yalnızca eklenir. `updated_at` ve `deleted_at` yok. Şifre, token ve kod yazılmaz. Kullanıcı satırı silinse de log kalır; bu yüzden `@relation` yoktur.

| Alan            | Tip            | Null | Açıklama                                                                                          |
| --------------- | -------------- | ---- | ------------------------------------------------------------------------------------------------- |
| `id`            | uuid           | PK   | Kayıt kimliği. UUID v4, otomatik.                                                                 |
| `user_id`       | uuid           | ✓    | İlgili hesap. Bilinmeyen e-posta ile başarısız girişte boş kalır. `(user_id, created_at)` index.  |
| `actor_user_id` | uuid           | ✓    | İşlemi başka bir kullanıcı yaptıysa onun kimliği.                                                 |
| `device_id`     | uuid           | ✓    | Varsa cihaz. Açık oturum bu satırdadır. Relation yok.                                             |
| `event`         | `UserLogEvent` |      | Olay. `(event, created_at)` index.                                                                |
| `ip`            | inet           | ✓    | İstek IP'si.                                                                                      |
| `user_agent`    | text           | ✓    | İstemci.                                                                                          |
| `metadata`      | jsonb          | ✓    | Sağlayıcı, denenen e-posta, değişen alanlar. Şifre, token ve kod girilmez.                        |
| `created_at`    | timestamptz    |      | Olay zamanı.                                                                                      |

---

## Enum — UserStatus

| Değer      | Anlam |
| ---------- | ----- |
| `active`   | Aktif |
| `inactive` | Pasif |
| `blocked`  | Bloke |

Humans'ta `STRING(50)` ve `isIn`. Taşımada Prisma enum.

## Enum — UserGender

| Değer    | Anlam                                         |
| -------- | --------------------------------------------- |
| `female` | Kadın                                         |
| `male`   | Erkek                                         |
| `other`  | Diğer. Bilinçli seçim.                        |
| `none`   | Seçilmemiş. Varsayılan. Arayüzde listelenmez. |

Humans dosyasının üstündeki typedef `other` değerini yazmaz. Geçerli küme `GENDER_TYPES` nesnesidir. Humans'ta `STRING(50)` ve `isIn`. Taşımada Prisma enum. Alan `user_detail` içindedir.

## Enum — UserAuthProvider

| Değer    | Anlam                                      |
| -------- | ------------------------------------------ |
| `email`  | E-posta ve şifre. Hash bu satırda durur.   |
| `google` | Google. `subject` sağlayıcı `sub`. Profil her girişte gelir. |
| `apple`  | Apple. `subject` sağlayıcı `sub`. Ad, soyad ve e-posta çoğu zaman yalnızca ilk girişte gelir. |

## Enum — DevicePlatform

| Değer     | Anlam    |
| --------- | -------- |
| `ios`     | iOS      |
| `android` | Android  |
| `web`     | Web      |

## Enum — PushProvider

| Değer      | Anlam                          |
| ---------- | ------------------------------ |
| `fcm`      | Firebase Cloud Messaging       |
| `apns`     | Apple Push Notification service |
| `web_push` | Web Push                       |

## Enum — VerificationType

| Değer                    | Anlam                    |
| ------------------------ | ------------------------ |
| `email_verify`           | Hesap e-postası          |
| `recovery_email_verify`  | Kurtarma e-postası       |
| `phone_verify`           | Cep telefonu             |
| `password_reset`         | Şifre sıfırlama          |
| `email_change`           | E-posta değişikliği      |

## Enum — UserLogEvent

| Değer                   | Anlam                          |
| ----------------------- | ------------------------------ |
| `register`              | Hesap açıldı.                  |
| `login_success`         | Giriş oldu.                    |
| `login_failed`          | Giriş olmadı.                  |
| `logout`                | Oturum kapandı.                |
| `logout_all`            | Tüm oturumlar kapandı.         |
| `password_changed`      | Şifre değişti.                 |
| `password_reset`        | Şifre sıfırlandı.              |
| `email_changed`         | E-posta değişti.               |
| `identity_linked`       | Giriş yöntemi bağlandı.        |
| `identity_unlinked`     | Giriş yöntemi kaldırıldı.      |
| `device_added`          | Cihaz eklendi.                 |
| `device_revoked`        | Cihaz kapatıldı.               |
| `session_revoked`       | Oturum kapatıldı.              |
| `token_reuse_detected`  | Refresh token tekrar kullanıldı. |
| `two_factor_enabled`    | İki adımlı doğrulama açıldı.   |
| `two_factor_disabled`   | İki adımlı doğrulama kapandı.  |
| `profile_updated`       | Profil güncellendi.            |
| `status_changed`        | Hesap durumu değişti.          |

---

## Unique ve indeksler

- `user`: unique `email` (`idx_user_email_unique`), `phone_mobile` (`idx_user_phone_mobile_unique`), `recovery_email` (`idx_user_recovery_email_unique`). Index `status`, `system_role_id`.
- `user_identity`: unique `(provider, subject)` (`idx_user_identity_provider_unique`), `(user_id, provider)` (`idx_user_identity_user_provider_unique`).
- `user_device`: unique `(user_id, installation_id)` (`idx_user_device_installation_unique`), `push_token` (`idx_user_device_push_token_unique`), `token_hash` (`idx_user_device_token_unique`).
- `user_verification`: unique `token_hash` (`idx_user_verification_token_unique`). Index `(user_id, type)`.
- `user_detail`: unique `phone_landline` (`idx_user_detail_phone_landline_unique`). Index `country_id`, `nationality_id`.
- `user_log`: index `(user_id, created_at)`, `(event, created_at)`.

---

## Yalnızca SQL

Prisma'nın yazamadığı kısıt.

- `idx_user_recovery_email_unique`: humans migration 052 kısmi unique index, `WHERE recovery_email IS NOT NULL`. Nullable `@unique` PostgreSQL'de birden fazla NULL'a izin verdiği için sonuç aynıdır. Migration yazılırken kısmi index humans'taki haliyle durur.
- `password` yalnızca `provider = email` satırında dolu olur. `refresh_token` yalnızca `provider = apple` satırında dolu olur. İkisi de CHECK değildir.
- `full_name` generated kolon değildir. Trigger yoktur. Domain, ad veya soyad yazılırken doldurur.
- `user_log` için UPDATE ve DELETE yasaktır. Şemada trigger yoktur; kural uygulama katmanındadır.
- Başka CHECK, trigger ve extension yok.

---

## Alan notu

- Sanal kolon yok.
- Soft-delete yalnızca `user.deleted_at`. Silinen satır e-posta ve telefon unique'ini tutmaya devam eder. Kısmi unique (`deleted_at IS NULL`) humans'ta da yok. `onDelete: Cascade` soft-delete'te çalışmaz; satır gerçekten silinince alt satırlar gider. `user_log` gitmez.
- Kayıt öncesi ve güncelleme öncesi: `user.email` trim ve küçük harf. `first_name` ve `last_name` trim. `full_name` bu ikisinden domain katmanında kurulur. `phone_mobile` trim. Aynı trim, `user_detail` içinde doğum yeri, sabit telefon, ehliyet, sigorta, vergi ve sağlık alanlarında da var. `recovery_email` doluysa trim ve küçük harf, boşsa null.
- Doğrulama: e-posta biçimi, ad ve soyad boş olamaz, cinsiyet ve durum kapalı küme, uuid kolonları UUID v4, metin uzunlukları kolon limitinde.
- Sorgu kapsamları: `active`, `inactive`, `blocked`, e-postası doğrulanmış (`is_email_verified`). Ülkeye göre sorgu `user_detail.country_id` üzerinden olur.
- Apple ad ve soyadı yalnızca ilk girişte gelir. `first_name` ve `last_name` o anda yazılır. Google fotoğrafı `image` olur.
- Aynı `token_hash` ikinci kez gelirse o cihazın oturumu kapanır. Başka cihazların oturumu durur.
- Aynı `push_token` başka kullanıcıya geçerse eski cihaz satırındaki token boşaltılır. Unique, bildirimin eski hesaba gitmesini engeller.
- `invite.user_id` bu modele bağlıdır. Yazılmayan bağlar: `user_settings.user_id`, `person.user_id`, adres ve banka `reference_id` (polimorfik, veritabanı FK'si yok).

---

## Bağlama

Domain taşınırken bu kurallar uygulanır. Karar: [`09-28-14-58`](../../decisions/09-28-14-58-giris-kayit-ayri.md).

- `user.email` yazışma adresidir ve tekildir. `user_identity.email` sağlayıcının bildirdiği adrestir ve tekil değildir. E-posta girişinde `subject` bu adresle aynıdır. Apple gizli adresinde ikisi farklı kalabilir. Aralarında yabancı anahtar yoktur.
- Giriş hesap açmaz. OAuth isteği `sign_in` veya `register` niyeti taşır. Sunucu niyeti kendisi uygular.
- `sign_in` yalnız mevcut `(provider, subject)` satırını açar. Satır yoksa hesap açılmaz ve bağlama yapılmaz.
- `register` yeni hesap açar. Doğrulanmış adres bir `user.email` ile aynıysa ikinci kullanıcı açılmaz. Kişi var olan yöntemle girer ve isterse bağlar.
- Apple gizli adresi eşleşmez. Bağlama yalnız açık oturumda olur.
- Google ve Apple bağlamak opsiyoneldir. E-posta ve şifre hesabı, sağlayıcı doğrulaması olmadan çalışır.
- Bağlama, açık oturumdaki `user_id` altına ikinci bir `user_identity` satırı yazar. Apple `refresh_token` o satırda durur. Ad ve fotoğraf `user` üzerine yazılır. Bu `subject` başka bir kullanıcıdaysa bağlama durur.
- Kayıt niyeti ve farklı adres yeni hesap açar. O `subject` doluysa sonradan başka hesaba taşınmaz.

## Açık soru

Auth domain testinde denetlenecek.

- Cihaz sayısı şemada sınırlı değildir. Sınır `(user_id, installation_id)` çiftidir. Her kurulumun kendi `token_hash` değeri vardır. Üst sınır testi sırasında seçilir.
- Google ve Apple girişi için yeni servisler gerekir. ID token doğrulama, hesap bağlama ve Apple token iptali bu listededir.
- Açık cihazın `last_seen_at`, `last_ip`, `app_version` ve push alanlarını güncelleyen servis gerekir.
- Davet kabulünde hesap açma, var olan hesaba bağlama ve doğrulanmamış hesabı doğrulanmış sayma kontrollü yazılır. Kişi ve erişim modelleri gelmeden kabul ucu tamamlanmaz.

---

## Eski user alanlarının yeri

| Eski alan | Yeni yer |
| --------- | -------- |
| `password`, `last_password_change_at` | `user_identity`, `provider = email` |
| `notification_key`, `notification_key_web` | `user_device.push_token` ve `platform` |
| `country_id`, `nationality_id`, `gender`, `birth_location`, `birthdate`, `phone_landline` | `user_detail` |
| ehliyet, sigorta, vergi, sağlık alanları | `user_detail` |
| geri kalanlar | `user` |

---

## Model ve migration farkı

- `recovery_email` unique'i humans `model.js` index listesinde yok. Migration 052 ekler. Esas migration.
- `system_role_id` kolon tanımında `references` yok. `belongsTo Role` ve migration 053 FK'si var. Bu kopyada kolon durur, `@relation` yoktur.
- `birthdate` humans modelinde `DATEONLY` ve artık `user_detail` içindedir. Migration 060 eski `timestamptz` değerini UTC takvim gününe çevirip `date` yapar. Şemada `@db.Date`. Üretilen Kysely tipi yine `Timestamp`; kolon tipi `date` olarak kalır.
- Bölünmüş tabloların migration'ı henüz yok. `pnpm db:generate` bu şema kesinleşmeden çalışmaz.
