# Oturum cihaz satırında

Tarih: 2026-09-28 · Durum: Geçerli

Karar: `user_session` yoktur, açık oturum `user_device.token_hash` ve `expires_at` üzerindedir, `subject` Google ve Apple `sub` değeridir, ad ve fotoğraf `user` üzerindedir, `user_log.session_id` kalkar ve kalan alt modeller `onDelete: Cascade` ile bağlı kalır.

Gerekçe: İki sağlayıcı kişiyi `sub` ile tanır. Ayrı oturum tablosu okumayı zorlaştırır. Aynı token ikinci kez gelirse o cihaz kapanır, diğer cihazlar durur.

Değişen: `user_session` ve `SessionRevokeReason` → cihaz token'ı. Eski karar [09-28-13-29](./09-28-13-29-user-modul-iliskileri.md).
