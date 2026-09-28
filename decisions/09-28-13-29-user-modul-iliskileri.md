# User modülü içi ilişki

Tarih: 2026-09-28 · Durum: Yerine geçti → [09-28-14-03-oturum-cihazda](./09-28-14-03-oturum-cihazda.md)

Karar: `user_identity`, `user_device`, `user_session`, `user_verification` ve `user_detail` `user`'a `@relation` ile bağlanır, `onDelete: Cascade`. `user_log` düz uuid kalır. `system_role_id`, `country_id` ve `nationality_id` düz uuid kalır.

Gerekçe: Bu tablolar hesabın parçasıdır. Log, hesap silinse de durur. Ülke, uyruk ve rol modelleri henüz yoktur.

Değişen: ilişki yok → modül içi `@relation`. Eski karar [09-28-10-38](./09-28-10-38-user-modeli.md).
