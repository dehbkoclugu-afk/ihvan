# Google Play görsel teslim manifesti — İhvan Android 1.0

Bu manifest, Google Play 1.0 mağaza paketi için üretilecek nihai dosyaların
adlarını ve kabul kurallarını tanımlar. Görsel yönü ve mağaza başlıkları için
`PLAY_STORE_LISTING.md` esas alınır.

## Ortak kabul kuralları

- Tüm ekran görüntüleri aynı imzalı 1.0 yayın adayından, Türkçe arayüzle ve
  portre yönünde çekilir.
- Ekran görüntüsü teslim boyutu **1080 × 1920 px**, biçimi **24-bit PNG**, renk
  uzayı **sRGB** ve alfa kanalı olmadan olmalıdır.
- Görselde cihaz çerçevesi kullanılacaksa uygulama ekranı okunabilir kalmalı;
  kırpma, kritik eylemleri veya alt navigasyonu kesmemelidir.
- Mağaza başlığı yalnız ekran görüntüsünün dışındaki tasarım katmanına eklenir.
  Kur’an metninin, ayet numarasının veya temel uygulama kontrolünün üstü
  kapatılmaz ve kutsal metin rötuşlanmaz.
- Gerçek kişi adı, günlük yazısı, e-posta, hesap adı, satın alma verisi, test
  hesabı, tam adres, hassas konum veya bildirim içeriği görünmez.
- **Placeholder, lorem ipsum, sahte arayüz, elle yazılmış sahte sayaç/istatistik,
  sonradan eklenmiş uygulama verisi ve mock ekran kullanılamaz.** Gereken ilerleme,
  yer imi veya ayar durumu yayın adayında normal kullanıcı eylemleriyle
  oluşturulur.
- Kur’an ayeti, dua, sûre/cüz adı ve dinî içerik yalnız uygulamanın paketlenmiş
  gerçek kaynağından gösterilir; yapay zekâ/makine çevirisi veya üretilmiş Arapça
  metin kullanılmaz.
- Sistem durum çubuğunda gerçek operatör, bildirim veya kişisel işaret
  görünmemeli; çekimler aynı saat/cihaz düzeninde tutarlı olmalıdır.
- Fiyat, indirim, deneme, “resmî”, “en doğru”, “garantili” veya dinî sonuç vaadi
  görsel başlıklarına eklenmez.

## Teslim dosyaları

Nihai dosyalar `store-assets/google-play/tr-TR/` altında aşağıdaki adlarla teslim
edilir. Bu dizin oluşana kadar manifestteki kalemler tamamlanmış sayılmaz.

| Dosya | Boyut / biçim | İçerik ve çekim koşulu |
|---|---|---|
| `01-bugun-gunluk-ayet.png` | 1080×1920 PNG | **Her gün Kur’an’la buluş.** Bugün ekranında günlük ayet ve ritüel kartları; Arapça ayet bütünüyle okunur ve alt navigasyon görünür. |
| `02-kuran-sure-cuz.png` | 1080×1920 PNG | **114 sûre, 30 cüz.** Kur’an sekmesinde sûre/cüz seçimi, arama alanı ve gerçek listenin yeterli bölümü. |
| `03-kuran-okuma.png` | 1080×1920 PNG | **Kaldığın yerden devam et.** Gerçek bir sûre okuma ekranında Arapça ayet, ayet numarası ve yer imi/okundu kontrolleri; metnin üstü kapanmaz. |
| `04-yer-imleri.png` | 1080×1920 PNG | **Yer imlerin hep yanında.** Paketlenmiş gerçek ayetlerden uygulama içinde normal eylemle oluşturulmuş birkaç yer imi; sahte kayıt veya özel veri yok. |
| `05-namaz-vakitleri-kible.png` | 1080×1920 PNG | **Namaz vakitleri ve kıble.** Vakit kartı ile kıble açısı birlikte; yalnız şehir düzeyinde güvenli test konumu, tam adres veya koordinat yok. |
| `06-vakit-bildirimleri.png` | 1080×1920 PNG | **Hatırlatmalar senin seçimin.** Uygulama içindeki bildirim durumu, seçilmiş namazlar ve hatırlatma ayarı; sistem izin diyaloğu görünmez. |
| `07-ibadet-takibi.png` | 1080×1920 PNG | **İbadet düzenini takip et.** Beş vakit işaretleme ve 7/30/90 günlük geçmiş; ilerleme yalnız uygulama içindeki normal test eylemleriyle oluşturulur. |
| `08-zikir-dua-gunluk.png` | 1080×1920 PNG | **Zikir, dua ve özel günlük.** Zikir ile paketlenmiş Kur’an’dan dua kartı; kişisel günlük metni ve placeholder not gösterilmez, günlük için boş durum kullanılabilir. |
| `feature-graphic-1024x500.png` | 1024×500, 24-bit PNG, sRGB, alfa yok | `PLAY_STORE_LISTING.md` feature graphic brief’ine uygun nihai grafik. Kur’an/dua metni, Arapça harf taklidi, mushaf sayfası, fiyat veya resmî kurum işareti içermez. |
| `play-icon-512.png` | 512×512, 32-bit PNG, sRGB | Google Play mağaza ikonu. `assets/icon.png` kaynağından keskin ve bozulmasız üretilir; teslim dosyasına köşe yuvarlatma veya dış gölge uygulanmaz. |

## Kaynak ve tutarlılık kontrolü

- Uygulama ikonunun kanonik kaynağı `assets/icon.png` (**1024 × 1024 px**),
  adaptive icon ön plan kaynağı `assets/brand-mark.png` dosyasıdır.
- Play ikonu, uygulama içindeki marka işareti ve feature graphic aynı renk/işaret
  ailesini kullanmalıdır; farklı logo varyantı türetilmez.
- Feature graphic brief ve sekiz ekran başlığı
  `docs/release/PLAY_STORE_LISTING.md` ile bire bir eşleşmelidir.
- Üretim sonrası her dosyanın piksel boyutu, PNG biçimi, renk uzayı ve alfa
  durumu teknik olarak doğrulanır; yalnız dosya uzantısına güvenilmez.
- Nihai görseller Play Console'a yüklenmeden önce kişisel veri, kutsal içerik,
  okunabilirlik ve yayın adayı eşleşmesi için ikinci kişi tarafından incelenir.

## Teslim kontrolü

- [ ] Sekiz ekran görüntüsü doğru ad, sıra, boyut ve içerikle hazır.
- [ ] Ekran görüntülerinde kişisel/hassas veri veya placeholder yok.
- [ ] Kur’an ve dua içeriği paketlenmiş gerçek kaynakla değişmeden eşleşiyor.
- [x] `feature-graphic-1024x500.png` brief ve kutsal içerik sınırına uyuyor.
- [x] `play-icon-512.png` kaynak ikonla uyumlu ve Play için teknik olarak geçerli.
- [ ] Tüm dosyalarda piksel/format/renk/alfa doğrulaması tamamlandı.
- [ ] Dosyalar nihai 1.0 yayın adayıyla görsel olarak karşılaştırıldı.

## Hazır dosyaların teknik kanıtı

| Dosya | SHA-256 | Doğrulama |
|---|---|---|
| `feature-graphic-1024x500.png` | `260114cfce8339cdf6a7c5472441686a0bd6941e5824bd9573a76bf3f612e0fd` | 1024×500, sRGB, TrueColor, alfa yok |
| `play-icon-512.png` | `49683e2e112782b879ff571e3f523b948abbe3d38da814b5facfebc7b6933819` | 512×512, sRGB, TrueColor, alfa yok |

İki dosya `store-assets/google-play/tr-TR/` altında tutulur. Sekiz uygulama
ekranı yalnız imzalı Android 1.0 yayın adayından çekildikten sonra kalan kabul
maddeleri işaretlenir; web export veya üretilmiş/mock arayüz mağaza kanıtı
olarak kullanılmaz.
