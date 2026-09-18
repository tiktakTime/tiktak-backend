# mobile

İndeks: [`apps/doc.md`](../doc.md)

**Dosya:** `index.ts` (`mobileRouter`)  
**Mount:** `app_config.surfaces.mobile` — **disabled** (stub)  
**Auth:** (plan) `authMiddleware` + `tenant: "member"` / self-service policy

---

## Amaç

Mobil uygulama özel uçları: çalışan self-service, absence, `work/my-*`, araç atamaları vb. [`common`](../common/doc.md) ve [`web`](../web/doc.md) ile **çakışmayan** slice'lar buraya eklenecek.

---

## Durum

| Özellik                      | Durum                |
| ---------------------------- | -------------------- |
| Router                       | Boş `createRouter()` |
| Slice'lar                    | Yok                  |
| `app_config.surfaces.mobile` | `enabled: false`     |

---

## Plan (özet)

- Ortak contract: `user` / `organization` → `common` yüzeyi (aynı path)
- Org yönetimi → `web` yüzeyi
- Mobile-only: kişisel işlemler, bildirim token, sahada veri girişi

---

## Kurallar

- Enable edildiğinde `authMiddleware` zorunlu olacak
- Kardeş import yasak; `core/` + `modules/` + kendi `domain/`
- Slice eklendiğinde bu belgeye tablo + `doc.md` linki eklenir
