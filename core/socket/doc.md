# socket

Socket.IO attach + invalidate emit köprüsü. Kimlik, oda adları ve oda
yetkilendirmesi **port** ile dışarıdan gelir.

Barrel: `@/core/socket`

```ts
attachSocketServer(httpServer, {
  authenticate: async (token) => ({ id, session }),
  room: (identity) => userRoom(identity.id),
  rooms: [
    {
      join: "join:organization",
      leave: "leave:organization",
      prefix: "org",
      canJoin: (identity, id) => /* yetki kontrolü */ true,
    },
  ],
});
```

`canJoin` verilmezse katılım serbesttir; `false` dönerse veya hata atarsa
socket odaya alınmaz. Wiring: `index.ts` (`platform/auth` + `platform/scope`).
