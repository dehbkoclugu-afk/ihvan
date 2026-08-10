# Android paywall yayın QA

Bu kontrol, `app/paywall.tsx`, `src/services/purchases.ts` ve profil abonelik
yönetimi sınırını Android 1.0 yayını için kapsar. Kur’an ve dini içerik
dosyalarına dokunulmamıştır.

## Kod denetimi sonucu

- Planlar ve yerelleştirilmiş fiyatlar yalnız Google Play/RevenueCat
  kataloğundan gelir; production ortamı fiyat veya deneme uydurmaz.
- Yalnız aylık ve yıllık paketler kabul edilir; entitlement yalnız
  `ihvan_plus` ile verilir.
- Satın alma başarılı, kullanıcı tarafından iptal edilmiş, pending,
  unavailable ve genel hata durumları ayrı kullanıcı mesajlarına sahiptir.
- Pending işlem Plus yetkisi vermez; uygulama öne geldiğinde CustomerInfo
  yeniden okunur.
- Restore görünürdür ve yalnız aktif `ihvan_plus` entitlement'ı bulursa Plus
  verir.
- Profilde aktif abonelik için Google Play abonelik yönetimi bağlantısı vardır.
- Paywall'a otomatik yenileme dönemi, deneme sonrası tahsilat, iptal yolu,
  mevcut dönem sonuna kadar erişim ve doğrudan abonelik yönetimi açıklaması
  eklendi.
- Paywall'dan uygulama içi "Gizlilik ve veriler" ekranına erişim eklendi.

## Yayın öncesi dış bağımlılıklar (NO-GO)

- Play Store listelemesinde herkese açık, çalışan ve uygulamanın gerçek veri
  davranışıyla uyumlu gizlilik politikası URL'si bulunmalıdır.
- Uygulamaya ait yayımlanmış kullanım şartları URL'si repoda bulunmuyor. Hukuki
  metin kullanılacaksa yayın sahibi tarafından onaylanmalı, herkese açık URL'de
  yayımlanmalı ve paywall/Store listing'e eklenmelidir. Genel Google Play
  şartları uygulamaya ait şartlar gibi gösterilmemelidir.
- Play Console ürün adı, billing period, fiyat, ücretsiz deneme süresi ve
  RevenueCat offering değerleri ekranda görülen bilgilerle bire bir eşleşmeden
  yayın yapılmamalıdır.

## Gerçek Google Play test matrisi

Testler Play'den kurulmuş kapalı-test AAB'si ve license tester hesabıyla
yapılır. Expo Go/mock katalog kanıt olarak kabul edilmez.

| Senaryo | Beklenen sonuç |
|---|---|
| Katalog yükleme | Aylık/yıllık plan ve yerel para birimi Play ile aynı; bilinmeyen paket görünmez. |
| Katalog kapalı/ağ yok | Plan düğmeleri görünmez, açıklayıcı hata ve `Tekrar dene` görünür. |
| Aylık satın alma | Play sheet doğru ürün/fiyatı gösterir; başarıdan sonra `ihvan_plus` aktif olur. |
| Yıllık satın alma | Play sheet doğru ürün/fiyatı gösterir; başarıdan sonra `ihvan_plus` aktif olur. |
| Ücretsiz deneme uygun | Süre ve deneme sonrası fiyat hem Play sheet'te hem paywall'da tutarlıdır. |
| Denemeye uygun değil | Paywall ücretsiz deneme vaadi göstermez. |
| Kullanıcı iptali | Plus verilmez; "Satın alma iptal edildi" mesajı görünür. |
| Pending ödeme | Plus verilmez; pending mesajı görünür; Play sonucu sonrası uygulama öne alındığında durum yenilenir. |
| Ödeme reddi/ağ hatası | Plus verilmez; tekrar denenebilir hata mesajı görünür. |
| Restore aktif üyelik | Uygulama verisi temizlendikten sonra aktif `ihvan_plus` geri gelir. |
| Restore üyelik yok | Plus verilmez; aktif üyelik bulunamadı mesajı görünür. |
| Aboneliği yönet | Doğru package hesabıyla Google Play abonelik sayfası açılır. |
| İptal sonrası erişim | Dönem bitene kadar Plus aktif, sona erince uygulama resume/yenilemede kapanır. |
| Gizlilik bağlantısı | Uygulama içi veri açıklaması açılır; Store gizlilik URL'si de ayrıca çalışır. |
| Erişilebilirlik | Plan adı, fiyat, deneme ve disabled/loading durumları ekran okuyucuda anlaşılır. |

Test kanıtına cihaz/Android sürümü, build number, test hesabı (e-posta yazmadan),
ürün ID, saat, Play sheet ekran görüntüsü ve RevenueCat CustomerInfo sonucu
eklenir. Makbuz, API anahtarı veya kişisel hesap bilgisi repoya konmaz.
