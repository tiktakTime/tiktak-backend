# Modules

Uygulama deseni katmanı: **Prisma şema + Kysely repo (+ sabitler)**.

Domain kuralları burada **değil** — `apps/<surface>/<slice>/domain/` altında yaşar.
Genel mimari: [`docs/architecture.md`](../docs/architecture.md)

---

## Kurallar (özet)

| Kural           | Anlam                                                               |
| --------------- | ------------------------------------------------------------------- |
| Saf veri        | Modül yalnızca tablo(lar) ve repo sunar                             |
| Domain yok      | Use-case `apps/*/domain`                                            |
| Kardeş import   | `modules` içi **serbest**. Yasak yalnızca `apps` (`core` tek paket) |
| Apps şeması yok | Repo kendi girdi tiplerini tanımlar                                 |
| Soft-delete     | Varsa `deleted_at`; repo varsayılan sorguları filtreler             |

Her modül klasöründe **`doc.md`** — alan açıklamaları, enum'lar, indeksler, repo yüzeyi.

---

## Repo belgesi derinliği

Modül `doc.md` dosyaları **orta derinlikte** tutulur:

1. **Alan tabloları** — mevcut doğru alan bilgisi korunur; silinmez.
2. **Repo yüzeyi** — her export edilen fonksiyon: kısa adım/davranış, ana parametreler, varsa hata kodları.
3. **Tüketiciler** — hangi `apps/<surface>/<slice>/domain/` dosyalarının çağırdığı belirtilir.
4. **Cross-link** — ilgili domain belgelerine bağlantı (`apps/*/domain/doc.md`).
5. **Tür notları** — entity / junction / lookup; soft-delete var mı; varsa kardeş modül bağımlılığı.

Junction tablolar (`role_permission`, `person_permission`) hard delete kullanır; entity tabloların çoğu `deleted_at` ile soft-delete eder. `access` ne soft-delete ne junction — üyelik köprüsü, hard delete.

---

## Klasör kalıbı

```
modules/<entity>/
  <entity>.prisma      # tablo
  enums.prisma         # varsa
  <entity>.repo.ts     # Kysely
  constants.ts         # varsa (ör. invite TTL)
  doc.md               # bu modülün belgesi
schema.prisma          # generator + datasource (model yok)
```

---

## Modül listesi

| Modül                                           | Tablo(lar)          | Tür            | Soft-delete         | Repo | Belge                                |
| ----------------------------------------------- | ------------------- | -------------- | ------------------- | ---- | ------------------------------------ |
| [user](./user/doc.md)                           | `user`              | Entity         | ✅                  | ✅   | [doc.md](./user/doc.md)              |
| [user_profile](./user_profile/doc.md)           | `user_profile`      | Entity (1:1)   | ❌ (user ile)       | ✅   | [doc.md](./user_profile/doc.md)      |
| [user_identity](./user_identity/doc.md)         | `user_identity`     | Entity         | ❌                  | ✅   | [doc.md](./user_identity/doc.md)     |
| [user_device](./user_device/doc.md)             | `user_device`       | Entity         | ❌ (`is_active`)    | ✅   | [doc.md](./user_device/doc.md)       |
| [organization](./organization/doc.md)           | `organization`      | Entity         | ✅                  | ✅   | [doc.md](./organization/doc.md)      |
| [person](./person/doc.md)                       | `person`            | Entity         | ✅                  | ✅   | [doc.md](./person/doc.md)            |
| [employee](./employee/doc.md)                   | `employee`          | Entity         | ✅                  | ✅   | [doc.md](./employee/doc.md)          |
| [access](./access/doc.md)                       | `access`            | Entity (köprü) | ❌ hard delete      | ✅   | [doc.md](./access/doc.md)            |
| [role](./role/doc.md)                           | `role`              | Entity         | ✅                  | ✅   | [doc.md](./role/doc.md)              |
| [permission](./permission/doc.md)               | `permission`        | Entity         | ✅                  | ✅   | [doc.md](./permission/doc.md)        |
| [role_permission](./role_permission/doc.md)     | `role_permission`   | Junction       | ❌ hard delete      | ✅   | [doc.md](./role_permission/doc.md)   |
| [person_permission](./person_permission/doc.md) | `person_permission` | Junction       | ❌ hard delete      | ✅   | [doc.md](./person_permission/doc.md) |
| [invite](./invite/doc.md)                       | `invite`            | Entity         | ✅ (sorgu filtresi) | ✅   | [doc.md](./invite/doc.md)            |
| [verification_code](./verification_code/doc.md) | `verification_code` | Entity         | ❌ status ile       | ✅   | [doc.md](./verification_code/doc.md) |
| [country](./country/doc.md)                     | `country`           | Lookup         | ✅                  | ✅   | [doc.md](./country/doc.md)           |

**15 modül** — hepsinde repo var.

---

## İlişki haritası (mantıksal)

Prisma'da FK satırları çoğu yerde yok; sahiplik uygulama + indekslerle yönetilir.

```
user ──┬── user_profile          (1:1 demografi)
       ├── user_identity         (N giriş yolu)
       ├── user_device           (N FCM cihaz)
       ├── access ── organization
       │      │
       │      └── person ── employee
       │             │
       │             ├── role ── role_permission ── permission
       │             └── person_permission ── permission
       │
       └── verification_code

organization ── invite ── person
country ← user_profile.country_id / organization.country_id / person.country_id
```

---

## Domain cross-link indeksi

| Modül             | Domain belgeleri                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| user              | [`apps/auth/domain/doc.md`](../apps/auth/domain/doc.md), [`apps/common/user/domain/doc.md`](../apps/common/user/domain/doc.md)                 |
| user_profile      | [`apps/auth/domain/doc.md`](../apps/auth/domain/doc.md) (oauth / create), [`modules/user/doc.md`](./user/doc.md)                               |
| user_identity     | [`apps/auth/domain/doc.md`](../apps/auth/domain/doc.md) (authenticate, oauth)                                                                  |
| user_device       | (plan) notification / device register                                                                                                          |
| organization      | [`apps/common/organization/domain/doc.md`](../apps/common/organization/domain/doc.md)                                                          |
| person            | [`apps/web/person/domain/doc.md`](../apps/web/person/domain/doc.md)                                                                            |
| employee          | [`apps/web/employee/domain/doc.md`](../apps/web/employee/domain/doc.md)                                                                        |
| access            | [`apps/web/access/domain/doc.md`](../apps/web/access/domain/doc.md), [`apps/auth/domain/doc.md`](../apps/auth/domain/doc.md)                   |
| role              | [`apps/web/role/domain/doc.md`](../apps/web/role/domain/doc.md)                                                                                |
| permission        | [`apps/web/permission/domain/doc.md`](../apps/web/permission/domain/doc.md)                                                                    |
| role_permission   | [`apps/auth/domain/doc.md`](../apps/auth/domain/doc.md) (`resolve-permissions`)                                                                |
| person_permission | [`apps/web/person/domain/doc.md`](../apps/web/person/domain/doc.md) (ileride)                                                                  |
| invite            | [`apps/web/invite/domain/doc.md`](../apps/web/invite/domain/doc.md), [`apps/public/invite/domain/doc.md`](../apps/public/invite/domain/doc.md) |
| verification_code | [`apps/auth/domain/doc.md`](../apps/auth/domain/doc.md) (`email-flows`)                                                                        |
| country           | `apps/admin` (plan)                                                                                                                            |

---

## Generator

[`schema.prisma`](./schema.prisma) — yalnızca `prisma-kysely` + datasource.  
Çıktı: `core/database/generated/kysely/`.  
Migration'lar: `core/database/prisma/migrations/`.

Detay: [`docs/database.md`](../docs/database.md)
