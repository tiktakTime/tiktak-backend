# User profile + identity + device (PENDING)

**Durum:** SQL taslak — henüz uygulanmadı. Onayından sonra Prisma migration klasörüne taşınıp `pnpm db:migrate` / `db:deploy` çalıştırılacak.

## Model ayrımı

| Tablo           | Modül                                                      | İçerik                                                                                            |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `user`          | [`modules/user`](../modules/user/doc.md)                   | Hot: email, isim, picture, locale, timezone, `*_verified_at`, `two_factor_enabled_at`, expires_at |
| `user_profile`  | [`modules/user_profile`](../modules/user_profile/doc.md)   | Cold: country, gender, birth*, phone*                                                             |
| `user_identity` | [`modules/user_identity`](../modules/user_identity/doc.md) | password / google / apple                                                                         |
| `user_device`   | [`modules/user_device`](../modules/user_device/doc.md)     | FCM push_token per device                                                                         |

## Rename’ler

| Eski                         | Yeni                                                |
| ---------------------------- | --------------------------------------------------- |
| `is_email_verified`          | `email_verified_at`                                 |
| `is_recovery_email_verified` | `recovery_email_verified_at`                        |
| `is_phone_verified`          | `phone_verified_at` (profile)                       |
| `expired_date` (user)        | `expires_at`                                        |
| `image` (user / person)      | `picture`                                           |
| `avatar_url` (taslak)        | `picture`                                           |
| `is_two_factor_enabled`      | `two_factor_enabled_at`                             |
| `email_at_provider`          | `provider_email`                                    |
| `phone_mobile`               | `phone_number` (user_profile, person, organization) |
| `notification_key*`          | `user_device.push_token`                            |
| `last_password_change_at`    | `user_identity.password_changed_at`                 |

## Dosyalar

| Dosya                                                                                                       | Rol             |
| ----------------------------------------------------------------------------------------------------------- | --------------- |
| [`modules/user/user.prisma`](../modules/user/user.prisma)                                                   | Hot user        |
| [`modules/user_profile/user_profile.prisma`](../modules/user_profile/user_profile.prisma)                   | Cold profil     |
| [`modules/user_identity/user_identity.prisma`](../modules/user_identity/user_identity.prisma)               | Giriş yolları   |
| [`modules/user_device/user_device.prisma`](../modules/user_device/user_device.prisma)                       | Cihaz / FCM     |
| [`PENDING_user_profile_identity.sql`](../core/database/prisma/migrations/PENDING_user_profile_identity.sql) | Backfill + drop |

## Env (OAuth)

```bash
GOOGLE_CLIENT_IDS=xxx.apps.googleusercontent.com,yyy.apps.googleusercontent.com
APPLE_CLIENT_IDS=com.example.app,com.example.service
```

## Endpoint

`POST /auth/oauth` — `{ provider: "google"|"apple", id_token, first_name?, last_name? }` → TokenPair

## Onay sonrası

1. SQL’i gözden geçir
2. PENDING dosyasını tarihli migration klasörüne taşı **veya** `prisma migrate dev --name user_profile_identity`
3. `pnpm db:generate` + `pnpm check`
4. Local DB’ye uygula — **bu adım onayınla**
