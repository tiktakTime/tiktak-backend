# socket

İndeks: [`core/doc.md`](../doc.md) · Odalar: [`platform/scope/doc.md`](../../platform/scope/doc.md) · Cache: [`core/cache/doc.md`](../../core/cache/doc.md)

Socket.IO attach + cache invalidate emit köprüsü. Kimlik, oda adları ve
`canJoin` **port** ile dışarıdan gelir — core ürün sabiti bilmez.

Barrel: `@/core/socket`

---

## Tipler

| Tip                   | Anlam                                               |
| --------------------- | --------------------------------------------------- |
| `SocketIdentity`      | `{ id, session? }` — `id` = userId, `session` = sid |
| `SocketRoomBinding`   | `{ join, leave, prefix, canJoin? }`                 |
| `AttachSocketOptions` | `authenticate`, `room?`, `rooms?`                   |

`canJoin` yoksa odaya katılım serbest; `false` / throw → join yok.

---

## `attachSocketServer(httpServer, options)`

1. Singleton `Server` (cors `*`); zaten varsa mevcut döner
2. `setSocketEmitter` kaydı — cache `invalidateKeys` → odalara `invalidate` event
   - odalar dolu → `io.to(room).emit("invalidate", queryKeys)`
   - boş → `io.emit` (broadcast)
3. Auth middleware (handshake):
   - token sırası: `handshake.auth.token` → `Authorization` bearer → `query.token`
   - yok → `"Authentication required"`
   - `options.authenticate(token)` null/throw → `"Invalid token"`
   - başarı → `socket.data.identity`
4. `connection`:
   - `options.room(identity)` varsa otomatik `join`
   - her binding için `join` / `leave` listener; `canJoin` async kontrol

Wiring örneği (kök `index.ts`):

```ts
attachSocketServer(httpServer, {
  authenticate: async (token) => {
    const claims = await verifyAccessToken(token);
    return { id: claims.sub, session: claims.sid };
  },
  room: (identity) => userRoom(identity.id),
  rooms: socketRoomBindings, // org join + canJoin
});
```

---

## Diğer export’lar

| Fonksiyon                   | Davranış                               |
| --------------------------- | -------------------------------------- |
| `getIO()`                   | Init edilmemişse throw                 |
| `closeSocket()`             | disconnectSockets + close (shutdown)   |
| `setInvalidateDebugLog(fn)` | Dev: emit öncesi log (oda + queryKeys) |

---

## Event sözleşmesi (FE)

| Event                | Yön             | Payload                                        |
| -------------------- | --------------- | ---------------------------------------------- |
| `invalidate`         | server → client | `queryKeys` (react-query / unity key dizileri) |
| `join:organization`  | client → server | `organizationId` string                        |
| `leave:organization` | client → server | `organizationId` string                        |

Oda adları: `user:{userId}`, `org:{organizationId}` — [`platform/scope`](../../platform/scope/doc.md).

---

## Bağımlılık

```
core/socket → core/cache (setSocketEmitter), core/http/bearer
index.ts → platform/auth + platform/scope + attachSocketServer
```
