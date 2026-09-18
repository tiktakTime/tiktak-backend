# user_identity

İndeks: [`modules/doc.md`](../doc.md) · Kimlik: [`user`](../user/doc.md)

**Tablo:** `user_identity`  
**Dosyalar:** `user_identity.prisma`, `enums.prisma`, `user_identity.repo.ts`  
**Tür:** Entity — giriş yöntemi (1 user → N identity).

**Soft-delete:** Yok — identity unlink ileride hard delete / revoke ile yönetilir.

---

## Amaç

Her satır bir giriş yolu: e-posta/şifre, Google veya Apple. Kalıcı dış kimlik `(provider, provider_subject)` çiftidir. Aynı kullanıcıya birden fazla provider bağlanabilir (auto-link).

Şifre hash’i `user` tablosunda **değil**; sadece `provider = password` satırında.

---

## Alanlar

| Alan                  | Tip            | Null | Açıklama                                                              |
| --------------------- | -------------- | ---- | --------------------------------------------------------------------- |
| `id`                  | uuid           | PK   | Identity satır kimliği                                                |
| `user_id`             | uuid           |      | Sahip hesap → `user.id`                                               |
| `provider`            | `AuthProvider` |      | `password` \| `google` \| `apple`                                     |
| `provider_subject`    | varchar(255)   |      | IdP `sub`. Password için sabit `"local"`. Unique with provider        |
| `provider_email`      | varchar(255)   | ✓    | Provider’ın o an verdiği e-posta (audit / debug; `user.email` değil)  |
| `password_hash`       | varchar(255)   | ✓    | bcrypt hash. Sadece `password` provider’da dolu                       |
| `password_changed_at` | timestamptz    | ✓    | Son şifre değişimi. Password policy / “şifreni değiştir” hatırlatması |
| `linked_at`           | timestamptz    |      | Bu identity’nin user’a bağlandığı an                                  |
| `last_used_at`        | timestamptz    | ✓    | Son başarılı login bu identity ile                                    |
| `created_at`          | timestamptz    |      |                                                                       |
| `updated_at`          | timestamptz    |      |                                                                       |

---

## Enum — AuthProvider

| Değer      | `provider_subject`    | Not                              |
| ---------- | --------------------- | -------------------------------- |
| `password` | `"local"`             | `password_hash` zorunlu pratikte |
| `google`   | Google ID token `sub` |                                  |
| `apple`    | Apple ID token `sub`  |                                  |

---

## Unique / indeksler

- Unique: `(provider, provider_subject)` — aynı Google hesabı iki user’a bağlanamaz
- Index: `user_id`

---

## Repo yüzeyi (`user_identity.repo.ts`)

| Fonksiyon               | Davranış                                                                    |
| ----------------------- | --------------------------------------------------------------------------- |
| `findByProviderSubject` | OAuth resolve: `(provider, sub)`                                            |
| `findPasswordByUserId`  | Sign-in / change-password hash okuma                                        |
| `insert`                | Yeni identity; `last_used_at = now()`                                       |
| `upsertPassword`        | Password identity yoksa insert, varsa hash + `password_changed_at` güncelle |
| `touchLastUsed`         | Login sonrası `last_used_at`                                                |

Sabit: `PASSWORD_SUBJECT = "local"`.

---

## Tüketiciler

| Domain                                             | Kullanım                                         |
| -------------------------------------------------- | ------------------------------------------------ |
| [`authenticate.ts`](../../apps/auth/domain/doc.md) | Password verify + touch                          |
| [`oauth.ts`](../../apps/auth/domain/doc.md)        | find / insert / link                             |
| [`user.repo`](../user/doc.md)                      | `createAuthUser`, `updatePassword`, admin create |
| [`apps/auth/index.ts`](../../apps/auth/index.ts)   | change-password current hash                     |
