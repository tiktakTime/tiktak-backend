# user_device

İndeks: [`modules/doc.md`](../doc.md) · Kimlik: [`user`](../user/doc.md)

**Tablo:** `user_device`  
**Dosyalar:** `user_device.prisma`, `enums.prisma`, `user_device.repo.ts`  
**Tür:** Entity — cihaz / FCM kaydı (1 user → N device).

**Soft-delete:** Yok — `is_active` + `revoked_at` ile pasifleştirilir.

---

## Amaç

Push bildirimi için **cihaz başına** FCM token. Kullanıcıya iki kolon (`notification_key` / `_web`) yerine N satır: telefon + tablet + tarayıcı aynı anda.

Redis cache (plan): `user_devices:{user_id}` → aktif `push_token` set’i; fanout worker DB’ye gitmeden okur.

Upsert anahtarı: global unique `push_token`. Aynı token başka user’a login olursa satır yeni `user_id`’ye geçer.

---

## Alanlar

| Alan           | Tip              | Null | Açıklama                                                                   |
| -------------- | ---------------- | ---- | -------------------------------------------------------------------------- |
| `id`           | uuid             | PK   | Cihaz kaydı kimliği                                                        |
| `user_id`      | uuid             |      | Sahip hesap → `user.id`                                                    |
| `platform`     | `DevicePlatform` |      | `ios` \| `android` \| `web`                                                |
| `push_token`   | varchar(512)     | ✓    | FCM registration token. Global unique. Null = henüz token yok / temizlendi |
| `device_id`    | varchar(255)     | ✓    | Client install id; token rotate olsa da aynı cihazı tanımak için           |
| `app_version`  | varchar(50)      | ✓    | Uygulama sürümü (debug / min-version)                                      |
| `is_active`    | boolean          |      | Bildirim gönderimine dahil mi                                              |
| `last_seen_at` | timestamptz      |      | Son register / heartbeat                                                   |
| `revoked_at`   | timestamptz      | ✓    | Logout / uninstall / invalid token sonrası pasifleşme anı                  |
| `created_at`   | timestamptz      |      |                                                                            |
| `updated_at`   | timestamptz      |      |                                                                            |

---

## Enum — DevicePlatform

| Değer     | Anlam                                               |
| --------- | --------------------------------------------------- |
| `ios`     | APNs üzerinden FCM veya native iOS client           |
| `android` | FCM Android                                         |
| `web`     | FCM Web (tek string token; native VAPID üçlüsü yok) |

---

## Unique / indeksler

- Unique: `push_token`
- Index: `user_id`, `(user_id, is_active)`

---

## Repo yüzeyi (`user_device.repo.ts`)

| Fonksiyon            | Davranış                                                    |
| -------------------- | ----------------------------------------------------------- |
| `upsertByPushToken`  | Token varsa user/platform güncelle + activate; yoksa insert |
| `listActiveByUserId` | Aktif + `push_token IS NOT NULL` satırlar                   |
| `revokeByPushToken`  | `is_active = false`, `revoked_at = now()` (user scoped)     |

---

## Tüketiciler

| Yer                                            | Kullanım                                               |
| ---------------------------------------------- | ------------------------------------------------------ |
| (plan) notification / device register endpoint | App login sonrası token kaydı                          |
| Legacy migration                               | Eski `notification_key` / `_web` → backfill bu tabloya |

Henüz auth route’a bağlı değil; şema + repo hazır.
