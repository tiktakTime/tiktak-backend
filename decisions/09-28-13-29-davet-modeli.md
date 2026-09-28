# Davet modeli ve yüzey

Tarih: 2026-09-28 · Durum: Geçerli

Karar: `invite` kendi token'ını tutar ve `user_verification` kopyası yazılmaz. `user_id` `user`'a `onDelete: SetNull` ile bağlanır. `organization_id` ve `person_id` düz uuid kalır. Link uçları `public`, gönderme uçları oturumlu `common` yüzeyindedir. Link uçları IP başına 20 istek / 60 saniyedir.

Gerekçe: Linki açan kişinin hesabı olmayabilir. Daveti gönderen kişinin oturumu vardır. İkisi aynı kapıda durursa gönderme herkese açılır.
