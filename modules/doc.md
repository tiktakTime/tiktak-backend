# Modules

Prisma şema kökü ve Kysely yüzeyi. Modeller humans’tan tek tek taşınır. Repo, model kopyasından sonra yazılır.

- `schema.prisma` — datasource ve generator
- `db.ts` — `db`, `closeDb` ve üretilen tiplerin uyguluma çıkışı
- [`user`](./user/doc.md) — hesap, giriş yöntemi, cihaz, doğrulama, detay ve log. Oturum cihaz satırındadır. Repo `user/repo.ts`.
- [`invite`](./invite/doc.md) — organizasyon daveti. Repo yok.

Genel: [`docs/database.md`](../docs/database.md)
