# user_profile

İndeks: [`modules/doc.md`](../doc.md) · Kimlik: [`user`](../user/doc.md)

**Tablo:** `user_profile`  
**Dosyalar:** `user_profile.prisma`, `enums.prisma`, `user_profile.repo.ts`  
**Tür:** Entity (1:1) — soğuk demografi / iletişim detayı.

**Soft-delete:** Yok — satır `user` ile yaşar; user soft-delete yeterli.  
**PK:** `user_id` (= `user.id`).

---

## Amaç

`user` tablosundaki hot alanlardan (isim, avatar, locale) ayrılmış **nadiren okunan** profil. Session’a kopyalanmaz. Üye kartı / admin user detayı gerektiğinde `user.repo.findById` join eder.

---

## Alanlar

| Alan                | Tip          | Null              | Açıklama                                               |
| ------------------- | ------------ | ----------------- | ------------------------------------------------------ |
| `user_id`           | uuid         | PK / FK mantıksal | Sahip hesap → `user.id`                                |
| `country_id`        | uuid         | ✓                 | İkamet / kayıt ülkesi → `country`                      |
| `nationality_id`    | uuid         | ✓                 | Uyruk → `country`                                      |
| `gender`            | `UserGender` |                   | `female` \| `male` \| `none` (person’daki `other` yok) |
| `birth_location`    | varchar(255) | ✓                 | Doğum yeri (serbest metin)                             |
| `birthdate`         | date         | ✓                 | Doğum tarihi (saat yok)                                |
| `phone_landline`    | varchar(15)  | ✓                 | Sabit hat. Unique **değil** (paylaşılan ofis hattı)    |
| `phone_number`      | varchar(50)  | ✓                 | Mobil / birincil telefon (eski `phone_mobile`). Unique |
| `phone_verified_at` | timestamptz  | ✓                 | Telefon OTP doğrulandığı an; `null` = doğrulanmamış    |
| `created_at`        | timestamptz  |                   | Profil satırı oluşturma                                |
| `updated_at`        | timestamptz  |                   | Son profil güncelleme                                  |

---

## Enum — UserGender

| Değer    | Anlam                          |
| -------- | ------------------------------ |
| `female` |                                |
| `male`   |                                |
| `none`   | Belirtilmedi / tercih edilmedi |

---

## Unique / indeksler

- Unique: `phone_number`
- Index: `country_id`, `nationality_id`

---

## Repo yüzeyi (`user_profile.repo.ts`)

| Fonksiyon      | Davranış                                                                        |
| -------------- | ------------------------------------------------------------------------------- |
| `findByUserId` | Tek satır; yoksa `undefined`                                                    |
| `upsert`       | Yoksa insert (defaults), varsa patch. `birthdate` Date’e çevrilir. Trx destekli |

---

## Tüketiciler

| Yer                                                          | Kullanım                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| [`user.repo`](../user/doc.md)                                | `findById` / `create` / `update` / `createAuthUser` orchestration |
| [`apps/auth/domain/oauth.ts`](../../apps/auth/domain/doc.md) | Yeni OAuth user’da boş profile upsert                             |
