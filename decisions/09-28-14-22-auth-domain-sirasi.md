# Auth domain taşıma sırası

Tarih: 2026-09-28 · Durum: Geçerli

Karar: Auth domain dört adımda taşınır. Önce humans kararları birebir yazılır, sonra yeni modellere bağlanır, sonra mevcut akış test edilir, en son açık sorular için test genişletilir.

Gerekçe: Humans'ta ayrı bir domain katmanı yoktur. Kararlar `auth/controller.js` ve `password-reset-service.js` içindedir. Yeni şemaya erken bağlamak bu kararları ezer.
