# Kalite araçları

Kod kalitesi denetimi — tip, lint, mimari, ölü kod, test.

## Stack (özet)

| Alan           | Araç                                                   |
| -------------- | ------------------------------------------------------ |
| Runtime        | Node.js 24 LTS                                         |
| Paket          | pnpm (tek root `package.json`)                         |
| HTTP / OpenAPI | Hono + `@hono/zod-openapi` + Scalar                    |
| Validation     | Zod (`apps/*/*.schema.ts` + `core/fields`)             |
| DB             | PostgreSQL · Prisma migrate · Kysely · `prisma-kysely` |
| Cache / queue  | Redis · BullMQ                                         |
| Realtime       | Socket.IO                                              |
| Storage        | AWS S3 SDK + Sharp                                     |
| Env            | `@t3-oss/env-core` + Zod (`core/env`)                  |

Bilinçli yok: Turborepo, pnpm workspaces, Prisma Client runtime, `defineModule` factory.

| Komut               | Araç                                             | Ne yapar                                                    |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| `pnpm format:check` | prettier                                         | Format denetimi (yazmaz)                                    |
| `pnpm check`        | `tsc --noEmit`                                   | Tip güvenliği                                               |
| `pnpm lint`         | ESLint + sonarjs                                 | Katman/barrel import yasakları + cognitive complexity       |
| `pnpm arch`         | dependency-cruiser                               | Döngü + katman ihlali + self-barrel + orphan                |
| `pnpm dead`         | knip                                             | Kullanılmayan dosya + bağımlılık + duplicate export         |
| `pnpm test`         | vitest                                           | Birim + entegrasyon testleri — [`testing.md`](./testing.md) |
| `pnpm verify`       | format:check + check + lint + arch + dead + test | CI kalite kapısı                                            |

CI her iki workflow'da (`test`, `main`) **push ve pull_request** üzerinde `verify`
koşar; `build` / `deploy` yalnızca push'ta çalışır (`if: github.event_name == 'push'`).

## Derleme zamanı korumalar

Bazı hata sınıfları test gerektirmez — `tsc` yazarken söyler. Test yükünü
azalttığı için bunlar **testten önce** kurulur. Detay: [`testing.md`](./testing.md).

| Desen                            | Yakaladığı                              | Nerede                                         |
| -------------------------------- | --------------------------------------- | ---------------------------------------------- |
| `satisfies Record<K, V>`         | Eksik anahtar                           | `platform/i18n/catalog.meta.ts` (`ERROR_META`) |
| Enum tek kaynak (`@/modules/db`) | Enum değeri silindi / adı değişti       | [`database.md`](./database.md)                 |
| `Record<Enum, …>` karar tablosu  | Enum'a **yeni değer eklendi**           | `modules/` kontrol noktası                     |
| `Pick<Selectable<T>, COLUMNS>`   | Kolon silindi / tipi değişti            | [`database.md`](./database.md)                 |
| Şema ↔ model tip köprüsü         | Kolon eklendi/silindi, sözleşme ayrıştı | [`api-standards.md`](./api-standards.md) §9    |

Kural: **derleyicinin yakalayabildiği şey için test yazılmaz.**

`satisfies Record` deseni şu an yalnızca iki yerde (`platform/i18n`). Yaygınlaştırma
adayı: `server/index.ts` `surfaceRouters` → `satisfies Record<SurfaceName, AppOpenAPI>`
(yeni yüzey eklenince router yazmayı unutmak çalışma zamanı hatası yerine derleme hatası olur).

---

## Katman kuralları — iki katmanlı savunma

```
index → server → apps → middlewares + modules + platform → core
```

| Yasak                                                   | ESLint | depcruise |
| ------------------------------------------------------- | ------ | --------- |
| `core` → apps/modules/middlewares/platform/server       | ✅     | ✅        |
| `platform` → apps/modules/middlewares/server            | ✅     | ✅        |
| `modules` → apps/platform/middlewares/server            | ✅     | ✅        |
| `middlewares` → apps/modules/server                     | ✅     | —         |
| `apps/X` → `apps/Y`                                     | ✅     | ✅        |
| `apps` → `server`                                       | ✅     | —         |
| Dışarıdan core/platform'a deep import (barrel zorunlu)  | ✅     | ✅        |
| Kendi barrel'ını import etme (self-barrel)              | ✅     | ✅        |
| Test barrel'dan import etmez                            | ✅     | —         |
| Yan etkili modül (queue/redis/database) başka barrel'da | —      | ✅        |
| Döngüsel import                                         | —      | ✅        |
| Orphan (ölü dosya)                                      | —      | ✅ (warn) |

**ESLint** (`@typescript-eslint/no-restricted-imports`) `@/...` alias import'larını
yazarken yakalar — IDE'de anlık geri bildirim.
**dependency-cruiser** modül grafiğine bakar: relative kaçışlar (`../../modules/db`),
`import x from "."` biçimleri, döngüler ve orphan'lar buradan çıkar. Biri diğerinin
yerine geçmez.

> `eslint-plugin-boundaries` denendi ve **kaldırıldı**: v7'de `type: { anyOf: [...] }`
> selector'ı plugin içinde patlıyor (`template.replaceAll is not a function`), policy
> eşleştirmesi sessizce başarısız oluyordu; `mode: "file"` pattern'i de repodaki her
> `index.ts`'e yapışıp yanlış pozitif üretiyordu. Negatif test bunu ortaya çıkardı.

## Barrel politikası

Core ve platform klasörleri birer **mini-paket**: her birinin tek `index.ts`'i o
paketin public API'sidir. İç içe barrel yok (`core/index.ts` / `platform/index.ts`
bilinçli olarak mevcut değil).

| Kim                                                                | Nasıl import eder                                    |
| ------------------------------------------------------------------ | ---------------------------------------------------- |
| Core/platform **dışı** (apps, modules, middlewares, server, index) | Yalnızca barrel: `@/core/http`                       |
| Aynı klasör **içi**                                                | Relative kardeş `./session`; kendi barrel'ı **asla** |
| Farklı core klasörü                                                | Barrel veya deep import serbest (döngü yönetimi)     |
| Testler                                                            | Doğrudan dosya `./hash` — barrel yasak               |

Yan etkili modüller (`core/queue` BullMQ kuyruğu, `core/redis` istemci,
`core/database` Pool — üçü de import anında bağlantı açar) başka bir barrel'dan
re-export edilmez; yoksa o barrel'a dokunan her test bağlantı açtırır.

Barrel, dış sınırda **refactor emici** olarak işe yarıyor: `core/auth` →
`platform/auth` taşımasında kod dört dosyaya bölündü ama 8 tüketicide yalnızca
birer satır değişti. Literatür de bu ayrımda birleşiyor — barrel dış sınırda
değerli (Nx "published API" modeli), paket içinde zararlı (tkdodo, Biome
`noBarrelFile`, Next.js `optimizePackageImports`). Döngüler barrel'ın varlığından
değil **kendi barrel'ını import etmekten** doğuyor; o desen artık iki araçla yasak.

## Kural gerçekten çalışıyor mu — negatif test

Kuralı kilitlemeden önce ihlalin yakalandığı **kanıtlanmalı**. Kanıtlanmış olan
dört desen ve beklenen çıktılar:

| Ekle                                      | Nereye                | Beklenen                                                     |
| ----------------------------------------- | --------------------- | ------------------------------------------------------------ |
| `import { db } from "@/modules/db"`       | `core/**`             | lint: `core yukarı bakmaz…` · arch: `core-yukari-bakmaz`     |
| `import … from "@/core/http/render"`      | `middlewares/**`      | lint: barrel-only · arch: `disaridan-core-deep-import-yasak` |
| `import … from "@/core/crypto"`           | `core/crypto/*.ts`    | lint: self-barrel · arch: `no-self-barrel` + `no-circular`   |
| `import … from "@/core/crypto"`           | `*.test.ts`           | lint: test barrel yasağı                                     |
| `export { getRedis } from "@/core/redis"` | `core/cache/index.ts` | arch: `yan-etkili-modul-re-export-edilmez`                   |

İkisi de sessiz kalırsa config ölüdür — plugin'in sessizce çalışmadığı bir kez
yaşandı. Test sonrası satırı geri al.

## Notlar

- Knip `exports` / `types` denetimi **kapalı**: barrel bilinçli olarak içeride tüketilenden fazlasını yayınlar (public API). Knip'in görevi ölü **dosya**, kullanılmayan **bağımlılık** ve duplicate export.
- Gerekçeli `ignore`: `core/files/**` (upload feature'ı gelmedi), `modules/country` + `modules/user_device` (endpoint bekliyor), `modules/person_permission` (ölü kod değil — yetki override'ı henüz `resolvePermissionSlugs`'a bağlı değil; ayrı iş olarak takipte).
- Cognitive complexity (eşik **15**) ve `no-explicit-any` artık **`error`** — sıfırlandıkları için kilitlendi; yeni ihlal CI'yı kırar. Ölçüm: refactor sonrası en karmaşık fonksiyon 8.
- `any` kullanımı yalnızca iki dosyada, dosya-başı `eslint-disable` + gerekçe ile: `core/http/define.ts` (tip-silinmiş `RouteDef`; çıkarım `defineRoute` generic'lerinde) ve `core/http/slice.ts` (Hono validated-input generic'leri). Başka yerde `any` hata verir.
- Karmaşıklık düşürmenin yolu soyutlama icat etmek değil, **çıkarım**: `acceptInvite` → `lockInvite` / `assertAcceptable` / `loadInvitePerson` / `resolveUserId`; `createRateLimit` → `isBypassedByEnv` / `clientIp` / `consumeQuota` / `applyQuotaHeaders`. Davranış birebir korunur.
- Testler `SKIP_ENV_VALIDATION=1` ile koşar (`vitest.config.ts`); yoksa `core/env` import anında gerçek secret ister.
- `pnpm arch:graph` için sistemde `graphviz` (`dot`) gerekir.
