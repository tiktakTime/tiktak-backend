# Proje Konsepti: Tiktak Backend

**İsim notu:** "Tiktak Backend" — hem taktik formasyon diline ("kırılmayan hat") hem klan/dostluk temasına ("asla yalnız savaşmıyorsun") gönderme yapıyor. Oyun içinde en güçlü, en zor ulaşılan efsanevi eşyanın adı olarak da kullanılabilir.

**Tema:** Dofus (taktik grid combat) + Project Zomboid (survival/permadeath-lite/risk ekonomisi) + Elden Ring (atmosfer/tasarım felsefesi)

**Kapsam stratejisi:** Küçük ve tam çalışan bir çekirdek ("alpha haritası") → zamanla MMO ölçeğine büyüme. Launch = final değil, temel his/felsefe launch'ta sabitlenir, içerik hacmi sonradan büyür.

---

## 1. Combat Sistemi

- [x] Hex/kare grid tabanlı, sıra tabanlı (turn-based) taktik savaş
- [x] Server-authoritative — client sadece görsel senkronizasyon
- [ ] Open-world (real-time) ↔ combat encounter (turn-based) geçiş mekaniği

### Kaynak sistemi (3 combat-içi kaynak + 1 progression kaynağı)

| Kaynak                  | Tip                                          | Ne yapıyor                                                                                                                      |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **AP (Action Point)**   | Combat-içi, her tur sıfırlanıp yeniden dolar | Yetenek ağacındaki spell'leri atmak için                                                                                        |
| **MP (Movement Point)** | Combat-içi, her tur sıfırlanıp yeniden dolar | Hareket; Can ağacındaki evrensel yetenekler (kaçınma, dayanıklılık, görünmezlik) için                                           |
| **RP (Ruh Point)**      | Combat-içi, her tur sıfırlanıp yeniden dolar | Ruh ağacı — meditasyon/güçlü vuruş; +RP harcayarak Yetenek spell'lerini modifiye etme (örn. 1 ok → 3 ok, oran artışı)           |
| **SP (Skill Point)**    | Kalıcı, level ile kazanılır                  | Can/Ruh/Yetenek ağaçlarına dağıtılır; AP/MP/RP'nin maksimum havuz kapasitesini artırır (Dofus'taki karakteristik puanı mantığı) |

- [x] Üç ağaç yapısı: **Can** (MP + evrensel/tüm sınıflarda ortak yetenekler), **Ruh** (RP + spell modifiye etme), **Yetenek** (AP + sınıfa özel 6-10 spell)
- [x] Aynı sınıf içinde SP dağıtım farkına göre build çeşitliliği (Yetenek-ağırlıklı / Ruh-ağırlıklı / Can-ağırlıklı build'ler)
- [x] Banking/biriktirme yok — tüm kaynaklar her turda sıfırlanıp dolu geliyor (Dofus'a sadık kalan tasarım)

**Balance prensipleri (playtest'te doğrulanacak):**

- [ ] Havuz tavanları (SP ile büyüyen max AP/MP/RP) kasıtlı olarak sınırlı tutulmalı — sınırsız büyüme "tek turda one-shot" riskini artırır
- [ ] Tasarım kuralı önerisi: hiçbir kombinasyon ortalama karakterin HP'sinin ~%60-70'inden fazlasını tek turda götürmemeli
- [ ] Karşı-önlem spell'leri (kalkan, damage reduction) her sınıfta bulunmalı — rakip tam kaynaklı geldiğinde gerçek bir tepki seçeneği olsun

**Sınıf tasarım felsefesi:**

- [ ] Alpha için önerilen 4 arketip: Yakın dövüş/Tank, Menzilli/Hasar, Kontrol/Taktik (pozisyon manipülasyonu), Destek/Heal
- [ ] Can ağacındaki evrensel yetenekler sınıf kimliğini sulandırmamalı — aynı yetenek sınıfa göre farklı davranmalı veya farklı maliyete sahip olmalı (örn. "kaçınma" Tank'ta blok, Suikastçı'da teleport)
- [ ] Element/direnç sistemi (Dofus tarzı Ateş/Su/Toprak/Hava) alpha'da atlanacak, sınıf-bazlı hasar farklılaşması yeterli — element katmanı ileride (canlı-servis genişlemesinde) eklenebilir

**PvP-progression dengesi riski:**

- [ ] SP ile büyüyen güç farkı, zorunlu PvP sisteminin adilliğini etkiliyor — seviye/güç bandına göre zorunlu PvP kısıtlaması gerekebilir (büyük SP farkı olan oyuncular birbirine zorunlu PvP başlatamasın)

**Kararlaştırılmadı / sonraki konuşma konusu:**

- Somut spell listesi (örnek bir sınıfın 6-10 spell'i)
- SP dağılımı ve havuz tavanlarının sayısal dengesi
- Encounter tetikleme mantığı (mob görüş alanı mı, rastgele mi, oyuncu tetikli mi)

## 2. Ölüm Cezası & Loot Sistemi

- [x] **Equipped eşyalar** (kuşanılan silah/zırh) ölümde korunur
- [x] **Envanterdeki her şey** ölüm anında bir "corpse/loot bag" nesnesine dönüşür
- [x] Corpse erişim modeli: **hibrit** — bölgeye göre açık (open loot) veya özel (private recovery)
- [x] Corpse timer: ~15-30 dk + haritada görsel işaretleme
- [x] Loot kaynağı: **sadece mob öldürerek** (pasif toplama yok) — bu, güç/beceri gate'i sağlıyor
- [x] Risk-tier formülü: `loot_tier = f(mob_zorluk_seviyesi, güvenli_bölgeye_mesafe)`
- [x] Güvenli bölgeden ~10 dk uzaklık = yüksek loot bölgesi (örnek referans nokta)

**Kararlaştırılmadı:**

- Tam loot tablosu / mob-bölge eşleştirmesi
- Corpse'un mob tarafından da yağmalanabilmesi (ekonomik sink olarak)

## 3. Zorunlu PvP Sistemi

- [x] Zorunlu/karşılıksız PvP başlatma: **saatte sınırlı hak** (saldırgan tarafı)
- [x] Kaçış: başarılı kaçıştan sonra **5 dakika simetrik dokunulmazlık** — bu süre boyunca ne saldırabilir ne saldırılabilirsin
- [x] Loot/mob riski immunity'den etkilenmiyor (loot mob-gated olduğu için ayrıca kısıtlamaya gerek yok)
- [x] Immunity görsel olarak işaretlenmeli (ikon/parıltı) — şeffaflık için
- [ ] Kaçış tetikleyicisinin kesin tanımı (mesafe eşiği mi, süre eşiği mi, otomatik mi)
- [ ] Rolling window mu (son 60 dk) yoksa sabit saatlik reset mi

**Kararlaştırılmadı:**

- Global sayaç mı, çift-bazlı (per-pair) sayaç mı — grup saldırısı senaryosu netleşmedi
- Kontestli/yüksek talep gören bölgeler için ayrı kurallar (ileri aşama)

## 4. Dünya & Bölge Sistemi

- [x] Güvenli bölgeler (şehir/merkez) — PvP yok, düşük/loot yok
- [x] Risk bölgeleri — mesafe + mob zorluğuna göre kademeli loot
- [ ] Harita ölçeği (alpha için kaç bölge?)
- [ ] Mob tipi ve zorluk eğrisi tasarımı

## 5. Backend / Persistence

- [x] Postgres — karakter, envanter, dünya state (Prisma/Kysely ile mevcut stack'e uyumlu)
- [x] Redis — rate-limit sayaçları (PvP hakları, immunity flag'leri), TTL bazlı
- [x] BullMQ — corpse despawn job'ları gibi zamanlanmış işler
- [x] Atomic transaction zorunluluğu: ölüm anında envanter boşaltma + corpse oluşturma tek transaction'da (dupe exploit önleme)
- [ ] Networking modeli detayı (WebSocket, tick rate, vs.)
- [ ] Real-time (open world) ↔ turn-based (combat) hibrit senkronizasyon mimarisi

## 6. Sanat & Atmosfer

- [x] İzometrik/2.5D, tam 3D model gerekmiyor (Dofus estetiğine yakın ama karanlık palet)
- [x] Elden Ring hissi: ışıklandırma + ses tasarımı + minimal exposition ile veriliyor, action-combat mekaniği alınmıyor
- [ ] Sanat yönü referansları (renk paleti, karakter tasarımı)

## 7. Teknik Yığın (detaylı)

| Katman                                                 | Seçilen                                            | Not                                                                                 |
| ------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Oyun Motoru                                            | Unity                                              | Cross-platform (Steam+mobile) olgunluğu, C# öğrenme eğrisi düşük                    |
| Combat/Grid                                            | Unity + custom grid + A\* Pathfinding Project      |                                                                                     |
| UI (client)                                            | Unity UI Toolkit                                   | Responsive, tek kod tabanından çoklu platform                                       |
| API/Backend                                            | Hono + Bun → Cloud Run                             |                                                                                     |
| Realtime                                               | WebSocket                                          | Turn-based ağırlıklı, Photon/Mirror'a gerek yok                                     |
| DB                                                     | Neon Postgres (Prisma + Kysely)                    |                                                                                     |
| Auth                                                   | Firebase Auth                                      | Steam ID linking + email/Google OAuth                                               |
| Steam SDK                                              | Steamworks.NET / Facepunch.Steamworks              |                                                                                     |
| Cache/Rate-limit                                       | Redis                                              | PvP sayaçları, immunity flag'leri                                                   |
| Queue                                                  | BullMQ                                             | Corpse despawn, dünya tick job'ları                                                 |
| Storage                                                | Cloudflare R2 (prod) / MinIO (local)               |                                                                                     |
| Mail                                                   | Resend                                             |                                                                                     |
| Deployment                                             | Google Cloud Run                                   |                                                                                     |
| Mobile CI/CD                                           | Unity Cloud Build veya kendi Xcode/Gradle pipeline |                                                                                     |
| Yüksek-performans corpse/loot (opsiyonel, ileri aşama) | Rust mikroservis                                   | Başlangıçta Postgres transaction + row-lock yeterli                                 |
| Monitoring/Logging                                     | **Kararlaştırılmadı**                              | Sentry / Grafana+Prometheus adayları                                                |
| Anti-cheat                                             | **Kararlaştırılmadı**                              | Server-authoritative mimari zaten büyük kısmını koruyor                             |
| Analytics                                              | **Kararlaştırılmadı**                              | PostHog/Mixpanel adayları — ekonomi dengesi izlemek için alpha'dan itibaren gerekli |

### Platform/Cross-play notları

- [x] Tek backend, Steam ve mobile sadece farklı client'lar — state tamamen sunucuda, local save yok
- [x] Ağır simülasyon (world tick, hunger, mob AI) sunucuda kalmalı — mobile client sadece render/UI yükü taşımalı (pil/performans için kritik)
- [x] Turn-based combat sayesinde touch/mouse input şeması doğal olarak uyumlu; açık dünya hareketi için point-and-click (dokunduğun yere yürü) önerilir — platformlar arası tutarlı
- [ ] App Store/Play Store loot box & gambling politikaları — ileride cash shop/gerçek para mekaniği eklenirse gözden geçirilmeli (şu anki tasarım: RNG'siz, mob-öldürerek loot, risk düşük)
- [ ] Mobilde arka plana atılma / bağlantı kopması senaryosu (özellikle PvP ortasında) — grace period + otomatik davranış tanımlanmalı

---

## Sonraki Konuşma Başlıkları

1. Combat sistemi detayları (sınıflar, spell tasarımı)
2. Networking mimarisinin (real-time/turn-based hibrit) teknik detayı
3. Alpha harita kapsamı (kaç bölge, kaç mob tipi ile başlanacak)
4. Global vs per-pair PvP sayaç kararı
