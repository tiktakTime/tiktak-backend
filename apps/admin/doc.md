# admin

İndeks: [`apps/doc.md`](../doc.md)

**Dosya:** `index.ts` (`adminRouter`)  
**Mount:** `app_config.surfaces.admin` — **disabled** (stub)  
**Auth:** (plan) süper-admin / sistem operatörü

---

## Amaç

Platform geneli yönetim: ülke yazma, verification-code, sistem ayarları, cross-tenant operasyonlar. Normal org [`web`](../web/doc.md) yüzeyinden ayrı.

---

## Durum

| Özellik                     | Durum                |
| --------------------------- | -------------------- |
| Router                      | Boş `createRouter()` |
| Slice'lar                   | Yok                  |
| `app_config.surfaces.admin` | `enabled: false`     |

---

## Plan (özet)

- `country` write, `verification_code` admin, global config
- Permission modeli: platform-level slug'lar (org `permission.*` dışı)
- Audit ve rate limit sıkı politikalar

---

## Kurallar

- Enable edildiğinde ayrı guard katmanı (süper-admin) gerekir
- Tenant verisi için `assertOrganization` yerine sistem scope (`tenant` / platform scope)
- Slice eklendiğinde endpoint tablosu + `domain/doc.md` bu belgeden linklenir
