# auth

TikTak oturum katmanı: claims şekli, Redis session, JWT+Redis verify, org-revoke.

Barrel: `@/platform/auth`

| Dosya                    | Rol                                                   |
| ------------------------ | ----------------------------------------------------- |
| `claims.ts`              | `AccessClaims`, `SessionRecord`, `TokenPair`          |
| `keys.ts`                | Redis key düzeni                                      |
| `session.ts`             | CRUD / rotate / update                                |
| `verify.ts`              | `verifyAccessToken`                                   |
| `revoke-organization.ts` | Org bağlam düşürme                                    |
| `context.d.ts`           | `AppVariables` RBAC augmentation (import gerektirmez) |

Mekanizma: `@/core/crypto` (JWT/hash/token), `@/core/http` (`extractBearerToken`).
