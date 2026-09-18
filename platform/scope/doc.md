# scope

Tenant çözümleme, socket oda adları ve oda yetkilendirmesi.

Barrel: `@/platform/scope`

| Dosya          | Rol                                                       |
| -------------- | --------------------------------------------------------- |
| `constants.ts` | Oda prefix’leri, socket event adları, scope key listesi   |
| `resolve.ts`   | `resolveScopeId`, `resolveOrganizationId`, `hydrateScope` |
| `rooms.ts`     | `userRoom`, `orgRoom`, `socketRoomBindings` (+ `canJoin`) |

Yalnız **tenant** çözümü istekten yapılır. Aktör (`user_id`) asla istekten
okunmaz — oturumdan gelir (`middlewares/permission.assertMember`).

Org odasına katılım oturumun aktif organizasyonuyla sınırlıdır (süper admin
muaf); aksi halde herkes başka bir organizasyonun invalidate trafiğini
dinleyebilirdi.

Boot: `configureRoutePlatform({ hydrateScope, … })` · socket `index.ts`.
