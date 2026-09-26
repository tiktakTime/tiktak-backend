# web

İndeks: [`apps/doc.md`](../doc.md)

**Dosya:** `index.ts` (`webRouter`)  
**Mount:** `app_config.surfaces.web` — enabled  
**Auth:** `authMiddleware` — tüm uçlar bearer zorunlu  
**Testler:** `tests/integrity/policy.integration.test.ts`

---

## Amaç

Org bağlamında yönetim slice'ları. Handler'lar `tenant: "org"` (session `organization_id` → `tenantId`) ve `policy` slug'larını kullanır.

---

## Slice'lar

| Slice      | Base                       | Permission prefix                           | Belge                                    |
| ---------- | -------------------------- | ------------------------------------------- | ---------------------------------------- |
| person     | `/organization/person`     | `person.*`                                  | [person/doc.md](./person/doc.md)         |
| employee   | `/organization/employee`   | `employee.*`                                | [employee/doc.md](./employee/doc.md)     |
| access     | `/organization/access`     | `access.*` (search/get: `tenant: "member"`) | [access/doc.md](./access/doc.md)         |
| role       | `/organization/role`       | `role.*`                                    | [role/doc.md](./role/doc.md)             |
| permission | `/organization/permission` | `permission.*`                              | [permission/doc.md](./permission/doc.md) |
| invite     | `/organization/invite`     | `invite.*`                                  | [invite/doc.md](./invite/doc.md)         |

**Mount sırası (`web/index.ts`):** person → employee → access → role → permission → invite

---

## Stub / NOT IMPLEMENTED

| Slice      | Uçlar                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------- |
| person     | `search-with-user`, `dashboard`, `compare-with-user`, `match-with-user`, `{id}/role-permission` |
| employee   | `dashboard`, `detail/{id}`                                                                      |
| permission | `with/role`                                                                                     |
| role       | `with/permission`                                                                               |

---

## Kurallar

- Org seçimi: client önce `GET /auth/switch/{organization_id}` veya sign-in sonrası session org
- Global user/org CRUD: [`common/doc.md`](../common/doc.md)
- Public invite accept: [`public/invite/doc.md`](../public/invite/doc.md)
- Cache invalidation: mutation'lar ilgili `search` / `get` cache'lerini temizler (`cachePrefix.org`)

---

## Domain ortaklaştırma politikası

Slice-özel guard'lar slice'ın kendi `domain/` klasöründe kalır; paylaşılan bir
`apps/web/domain/` klasörü **yok** (denendi, slice anatomisine aykırı olduğu için
geri alındı). Kayıt yok kontrolü açık yazılır — `if (!row) throw new AppError(...)`,
ayrı helper yoktur.

Ortaklaştırma eşiği **üç tekrar**: aynı desen iki slice'ta göründüğünde bekle,
üçüncüde soyutlamayı tartış. `role` ↔ `permission` ikizliği bilinçli olarak
duruyor — ikisi zaten ayrışmaya başladı (`createPermission` global slug kontrolü
taşıyor, `createRole` taşımıyor), yani acele DRY yanlış soyutlama üretirdi.

Guard'lar barrel'dan (`domain/index.ts`) export **edilmez**; yalnızca kardeş
domain dosyaları relative import eder. Barrel route'ların kullandığı use-case'leri
yayınlar.
