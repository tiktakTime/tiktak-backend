# Kod inceleme sırası

Belgelendirme oturduktan sonra kodu **klasör klasör** değil, **bir isteğin izlediği yolu** takip ederek okumak en verimli yöntem. Her katman gerçek bağlamda görünür.

Okuma rutini (her dilimde):

1. Slice `doc.md` — endpoint, guard, schema, response `code`
2. `domain/doc.md` — adımlar (spec)
3. İlgili `.ts`
4. Çağırdığı `modules/*.repo`

Belge ile kod sapıyorsa önce hangisinin “doğru” olduğuna karar ver (`domain/doc.md` = spec hedefi).

İndeks: [`docs/README.md`](./README.md) · Mimari: [`architecture.md`](./architecture.md)

---

## 1. Omurga (yarım gün)

Her istek buradan geçer. Derine inmeden “request nasıl context’e düşüyor?” yeter.

| Sıra | Belge → kod                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------- |
| 1    | [`app.config.ts`](../app.config.ts) — `app_config`: surfaces, cache, pagination, `rate_limit`   |
| 2    | [`server/doc.md`](../server/doc.md) → [`server/index.ts`](../server/index.ts) — mount sırası    |
| 3    | [`index.ts`](../index.ts) — listen, socket, shutdown                                            |
| 4    | [`middlewares/doc.md`](../middlewares/doc.md) → `auth.ts` + `permission.ts` (+ `rate-limit.ts`) |

İnce motor dilimi (hepsini bitirme):

- [`core/http/doc.md`](../core/http/doc.md) — `defineRoute` / `createSlice`, `AppError` → [`errors`](../core/errors/doc.md)
- [`platform/auth/doc.md`](../platform/auth/doc.md) — claims + Redis session ([`core/crypto`](../core/crypto/doc.md) JWT motoru)

---

## 2. İlk dikey dilim: auth → org switch

Neredeyse tüm web uçları buna bağlı. Öncelikli inceleme.

| Sıra | Belge → kod                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [`apps/auth/doc.md`](../apps/auth/doc.md) → [`apps/auth/index.ts`](../apps/auth/index.ts) (`sign-in` / `member` / `switch`)     |
| 2    | [`apps/auth/domain/doc.md`](../apps/auth/domain/doc.md) → `authenticate.ts`, `switch-organization.ts`, `resolve-permissions.ts` |
| 3    | [`modules/access`](../modules/access/doc.md) + [`modules/role_permission`](../modules/role_permission/doc.md)                   |
| 4    | [`platform/auth`](../platform/auth/doc.md) — session yazma                                                                      |

**Bilinen boşluk:** `person_permission` henüz `resolvePermissionSlugs`’a bağlı değil — okurken not al.

---

## 3. Riskli domain’ler

Omurga oturunca ⚠’li ve transaction’lı parçalar:

| Öncelik | Dilim                                                                                                                           | Neden                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1       | [`apps/public/invite`](../apps/public/invite/doc.md) → [`domain/doc.md`](../apps/public/invite/domain/doc.md)                   | `acceptInvite` — `FOR UPDATE`, çok tablo |
| 2       | [`apps/web/invite`](../apps/web/invite/doc.md) → [`domain/doc.md`](../apps/web/invite/domain/doc.md)                            | create/resend; mail hata yutma           |
| 3       | [`apps/web/access`](../apps/web/access/doc.md) → [`domain/doc.md`](../apps/web/access/domain/doc.md)                            | `upsertAccess` — transaction yok         |
| 4       | [`apps/web/employee`](../apps/web/employee/doc.md) → [`domain/doc.md`](../apps/web/employee/domain/doc.md)                      | `creator` + soft-delete                  |
| 5       | [`apps/web/person`](../apps/web/person/doc.md) → [`domain/doc.md`](../apps/web/person/domain/doc.md)                            | create / soft-delete cascade             |
| 6       | [`apps/common/organization`](../apps/common/organization/doc.md) → [`domain/doc.md`](../apps/common/organization/domain/doc.md) | `createOrganizationWithOwner`            |

---

## 4. Bilerek ertele

Şimdilik derinleşme:

- `apps/mobile` / `apps/admin` stub’ları
- Person / employee `not_implemented` uçları
- `core/files` (tüketici yok), `unity` query-key kalıntısı
- Tüm `core` kardeş-import borcu (iş kuralı değil; motor wiring)

---

## Pratik gün planı

| Zaman             | Ne                                                                        |
| ----------------- | ------------------------------------------------------------------------- |
| Sabah             | Omurga (`app_config` → `server` → middleware) + auth `sign-in` → `switch` |
| Öğleden sonra     | Public invite `accept`                                                    |
| Sonraki oturumlar | access → employee → person → organization                                 |

---

## İlgili belgeler

| Belge                                    | İçerik                                |
| ---------------------------------------- | ------------------------------------- |
| [`apps/doc.md`](../apps/doc.md)          | Yüzey / slice indeksi, okuma sırası   |
| [`modules/doc.md`](../modules/doc.md)    | Repo + alan belgeleri                 |
| [`core/doc.md`](../core/doc.md)          | Motor paketleri                       |
| [`architecture.md`](./architecture.md)   | Bağımlılık yönü, kardeş import yasağı |
| [`layers.md`](./layers.md)               | Katman detayı                         |
| [`api-standards.md`](./api-standards.md) | `defineRoute` sözleşmesi              |
| [`platform/doc.md`](../platform/doc.md)  | auth · scope · notifications · i18n   |
