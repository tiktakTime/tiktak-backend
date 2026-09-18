# crypto

Payload-agnostik kripto yardımcıları. Session / claims bilmez.

Barrel: `@/core/crypto`

| Dosya      | Rol                                           |
| ---------- | --------------------------------------------- |
| `jwt.ts`   | `signJwt` / `verifyJwt` (HS256, `JWT_SECRET`) |
| `hash.ts`  | `sha256`                                      |
| `token.ts` | `randomToken`, `newId`                        |

Oturum + claims → `@/platform/auth`.
