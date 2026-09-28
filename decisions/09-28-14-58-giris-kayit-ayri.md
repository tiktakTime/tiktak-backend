# Giriş kayıt açmaz

Tarih: 2026-09-28 · Durum: Geçerli

Karar: OAuth niyeti `sign_in` veya `register` olur. Giriş hesap açmaz ve bağlamaz. Kayıt, doğrulanmış adres mevcut `user.email` ile aynıysa ikinci kullanıcı açmaz. Apple gizli adresi eşleşmez. Bağlama yalnız açık oturumda ve opsiyoneldir.

Gerekçe: Girişin kayıt açması ikinci hesap doğurur. E-posta hesabı, Google veya Apple doğrulaması olmadan çalışır.
