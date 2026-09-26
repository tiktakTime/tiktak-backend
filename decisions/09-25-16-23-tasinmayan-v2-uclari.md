# Taşınmayan v2 uçları

Tarih: 2026-09-25 · Durum: Geçerli

Karar: Aşağıdaki `tiktak-service-humans` v2 uçları yeni API'ye taşınmaz.

Gerekçe: Web ve mobil ekranlarından hiçbiri bu uçlara ulaşmıyor.

Doğrulama kodu

- `GET /core/v2/verification-code/search`
- `POST /core/v2/verification-code`
- `GET /core/v2/verification-code/{id}`
- `PATCH /core/v2/verification-code/{id}`
- `DELETE /core/v2/verification-code/{id}`

Kullanıcı

- `GET /core/v2/user/search`
- `POST /core/v2/user`

Ülke

- `POST /core/v2/country`

Organizasyon

- `GET /core/v2/organization/search`
- `PATCH /core/v2/organization/{id}/restore`

Erişim

- `POST /core/v2/organization/access`
- `GET /core/v2/organization/access/{id}`
- `PATCH /core/v2/organization/access/{id}`
- `DELETE /core/v2/organization/access/{id}`

Davet

- `GET /core/v2/organization/invite/{id}`
- `PATCH /core/v2/organization/invite/{id}`
- `DELETE /core/v2/organization/invite/{id}`

Firma

- `PATCH /core/v2/organization/company/{id}/restore`

Kişi

- `PATCH /core/v2/organization/person/{id}/restore`

Çalışan

- `GET /core/v2/organization/employee/detail/{id}`

İzin

- `POST /core/v2/organization/permission`
- `GET /core/v2/organization/permission/{id}`
- `DELETE /core/v2/organization/permission/{id}`
- `GET /core/v2/organization/permission/with/role`

Rol

- `GET /core/v2/organization/role/with/permission`

Sipariş

- `PATCH /core/v2/organization/order/{id}/cancel`

E-posta kaydı

- `GET /core/v2/organization/email-log/{id}`

Hakediş

- `GET /core/v2/organization/settlement/search`
- `GET /core/v2/organization/settlement/{id}/available-proofs`
- `GET /core/v2/organization/settlement/room/{id}/calculate-status`

Çalışma alanı

- `GET /core/v2/organization/workspace/main`

Araç

- `GET /core/v2/organization/vehicle/activity/{id}`
- `GET /core/v2/organization/vehicle/brand/{id}`
- `GET /core/v2/organization/vehicle/brand/{id}/models`
- `GET /core/v2/organization/vehicle/class/{id}`
- `GET /core/v2/organization/vehicle/{id}/color-history/search`
- `GET /core/v2/organization/vehicle/{id}/color-history/{id}`

İş filtresi

- `GET /core/v2/organization/work/work-filters/search`
- `POST /core/v2/organization/work/work-filters`
- `GET /core/v2/organization/work/work-filters/{id}`
- `PATCH /core/v2/organization/work/work-filters/{id}`
- `DELETE /core/v2/organization/work/work-filters/{id}`

Nitelik istatistiği

- `GET /core/v2/organization/form/attribute/attribute-statistics/search`
- `POST /core/v2/organization/form/attribute/attribute-statistics`
- `GET /core/v2/organization/form/attribute/attribute-statistics/{id}`
- `PATCH /core/v2/organization/form/attribute/attribute-statistics/{id}`
- `DELETE /core/v2/organization/form/attribute/attribute-statistics/{id}`

İşlev

- `GET /core/v2/organization/form/functionality/search`
- `POST /core/v2/organization/form/functionality`
- `GET /core/v2/organization/form/functionality/{id}`
- `PATCH /core/v2/organization/form/functionality/{id}`
- `DELETE /core/v2/organization/form/functionality/{id}`
