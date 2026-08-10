# İhvan Gizlilik Politikası — Türkçe taslak

> **Yayın öncesi hukuki ve operasyonel taslak.** Bu metin hukuki danışmanlık
> veya mevzuata uygunluk garantisi değildir. Köşeli parantezli alanlar
> doldurulmadan, veri akışları gerçek release build ve Play Console Data safety
> beyanıyla yeniden doğrulanmadan yayımlanmaz.

**Son güncelleme:** [GG.AA.YYYY — ZORUNLU]

**Veri sorumlusu / uygulama yayıncısı:** [TAM YASAL AD VEYA TİCARİ UNVAN — ZORUNLU]

**Adres / ülke:** [TEBLİGATA ELVERİŞLİ ADRES VE ÜLKE — ZORUNLU]

**Gizlilik iletişimi:** [AKTİF DESTEK/GİZLİLİK E-POSTASI — ZORUNLU]

## 1. Kapsam

Bu politika, Android paket adı `com.ihvan.quran` olan **İhvan** mobil
uygulamasında bilgilerin nasıl işlendiğini açıklar. İhvan; Kur’an okuma,
yer imi ve ilerleme takibi, namaz vakitleri ve kıble, isteğe bağlı yerel namaz
bildirimleri, zikir, ibadet takibi ve kişisel günlük işlevleri sunar.

## 2. Cihazda işlenen ve saklanan bilgiler

Uygulama aşağıdaki bilgileri varsayılan olarak cihazdaki yerel uygulama
depolamasında tutar:

- isteğe bağlı profil adı ile tema ve yazı boyutu tercihleri;
- Kur’an'da son okunan konum, ayet numaraları, yer imleri, okuma geçmişi ve
  hedefleri;
- namaz işaretleri, zikir sayacı, günlük ritüel/seri kayıtları;
- kullanıcının yazdığı kişisel günlük notları;
- bildirim tercihleri ve seçilen namaz vakitleri.

Bu kayıtlar için uygulama hesabı oluşturulmaz ve mevcut uygulama kodunda bunları
yayıncının sunucusuna eşitleyen bir özellik yoktur. Kullanıcı "Verilerimi dışa
aktar" işlemini açıkça seçerse kayıtlar JSON dosyası olarak cihazın paylaşım
menüsüne verilir. Dosyanın bundan sonra gönderileceği uygulama ve alıcıyı
kullanıcı seçer; seçilen üçüncü tarafın kendi gizlilik koşulları geçerlidir.

## 3. Konum

Kullanıcı izin verirse uygulama açıkken cihazın yaklaşık/mevcut konumu namaz
vakitlerini ve kıble yönünü hesaplamak, ayrıca okunabilir bir konum etiketi
oluşturmak için kullanılır. Arka planda konum izleme yapılmaz. İzin cihaz
ayarlarından kaldırılabilir; bu durumda konuma bağlı işlevler çalışmayabilir.

> **Release doğrulaması:** Tersine coğrafi kodlamanın cihaz/işletim sistemi
> sağlayıcısına veri aktarımı ve kesin/approximate location sınıflandırması,
> yayın AAB'sinde ve Play Data safety formunda ayrıca doğrulanmalıdır.

## 4. Bildirimler

Namaz hatırlatmaları kullanıcı açarsa cihazda planlanan yerel bildirimlerdir.
Kullanıcı hangi vakitleri ve hatırlatma zamanını seçebilir; izni işletim sistemi
ayarlarından kapatabilir. Mevcut uygulama davranışında pazarlama bildirimi veya
uzak push mesajı gönderilmez.

## 5. Abonelik ve satın alma verileri

İhvan Plus abonelikleri Google Play üzerinden satın alınır. Ürün kataloğunun
gösterilmesi, satın alma sonucunun doğrulanması, aktif erişimin belirlenmesi ve
satın alımların geri yüklenmesi için RevenueCat SDK kullanılır. Bu süreçte
Google Play ve RevenueCat; uygulama kullanıcı tanımlayıcısı, ürün/abonelik ve
işlem durumu ile teknik tanımlayıcılar gibi kendi hizmetlerini sunmak için
gereken bilgileri kendi koşulları uyarınca işleyebilir. Uygulama tam ödeme kartı
bilgilerini almaz veya saklamaz.

İlgili üçüncü taraf açıklamaları:

- [Google Gizlilik Politikası](https://policies.google.com/privacy)
- [Google Play Hizmet Şartları](https://play.google.com/intl/tr_tr/about/play-terms/)
- [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy/)
- [RevenueCat'in topladığı veriler hakkındaki teknik açıklama](https://www.revenuecat.com/docs/technical-resources/data-collected-by-revenuecat)

## 6. İşleme amaçları ve hukuki dayanak

Bilgiler; kullanıcının istediği uygulama özelliklerini sağlamak, tercihleri
hatırlamak, abonelik erişimini doğrulamak, güvenlik/hata giderme ve yasal
yükümlülükleri yerine getirmek amaçlarıyla işlenir. Geçerli hukuki dayanaklar
ülkeye göre değişebilir.

> **Yayın bağımlılığı:** Yayıncı; hedef ülkeler ve kendi hukuki statüsüne göre
> sözleşmenin ifası, açık rıza, meşru menfaat ve/veya yasal yükümlülük gibi
> uygulanabilir dayanakları hukuk uzmanıyla belirlemelidir. Bu taslak tek başına
> KVKK/GDPR uyumluluğu sağlamaz.

## 7. Saklama ve silme

Yerel ilerleme ve günlük kayıtları kullanıcı uygulama içindeki veri yönetimi
araçlarıyla silebilir. Uygulamanın kaldırılması işletim sisteminin uygulama
verilerini silmesine yol açabilir; cihaz yedeği davranışı işletim sistemi ve
kullanıcının ayarlarına bağlıdır. Dışa aktarılan kopyaların silinmesinden
kullanıcı sorumludur.

Google Play ve RevenueCat'in tuttuğu işlem/abonelik kayıtlarının saklama ve
silme süreleri kendi politikaları ve yasal yükümlülüklerine tabidir. Bu
hizmetlerdeki bir talep için önce [GİZLİLİK E-POSTASI] üzerinden yayıncıyla
iletişime geçilebilir.

## 8. Paylaşım ve uluslararası aktarım

Yerel kullanıcı içeriği, kullanıcı dışa aktarmayı seçmedikçe yayıncı tarafından
üçüncü taraflara gönderilmez. Satın alma ve abonelik işlemlerinde Google Play ve
RevenueCat hizmet sağlayıcı olarak rol alır; verileri kullanıcının ülkesinin
dışında işleyebilirler. Aktarım mekanizmaları ve taraf rolleri yayıncı ile bu
sağlayıcılar arasındaki güncel sözleşmeler üzerinden doğrulanmalıdır.

## 9. Çocuklar

Uygulamanın hedef yaş grubu ve çocuklara yönelik olup olmadığı
**[PLAY CONSOLE HEDEF KİTLE KARARI — ZORUNLU]** olarak kesinleştirilmemiştir.
Yayıncı hedef kitleyi Play Console'da doğru beyan etmeli ve çocuklar hedef
kitleye dahilse Families politikası, yaşa uygun tasarım ve gerekli ebeveyn
izinleri için ayrı inceleme yapmalıdır.

## 10. Haklar ve başvurular

Bulunulan ülkeye göre kullanıcı; kişisel verileri hakkında bilgi, erişim,
düzeltme, silme, işlemeyi kısıtlama veya itiraz gibi haklara sahip olabilir.
Başvurular [GİZLİLİK E-POSTASI] adresine yapılabilir. Kimlik doğrulamak için
yalnız talebi sonuçlandırmak bakımından gerekli bilgi istenir.

## 11. Güvenlik ve değişiklikler

Makul teknik ve organizasyonel önlemler uygulanmaya çalışılır; hiçbir yöntem
mutlak güvenlik garantisi vermez. Bu politika değişirse güncelleme tarihi
yenilenir ve önemli değişiklikler uygun bir kanalla bildirilir.

## 12. İletişim

**[YAYINCI YASAL ADI]**

[POSTA ADRESİ]

[DESTEK/GİZLİLİK E-POSTASI]

## Yayın operatörü kontrolü (metnin parçası olarak yayımlanmaz)

- [ ] Tüm placeholder'lar gerçek ve desteklenen bilgilerle değiştirildi.
- [ ] Politika herkese açık, aktif, coğrafi engeli olmayan HTTPS URL'de ve PDF
  olmayan okunabilir sayfada yayımlandı.
- [ ] URL Play Console gizlilik alanına ve uygulama içindeki ilgili bağlantıya
  eklendi.
- [ ] Release AAB izinleri/SDK'ları, bu metin ve Data safety formu aynı veri
  akışını anlatıyor.
- [ ] RevenueCat dashboard ve sözleşmesindeki taraf/aktarım/saklama rolleri
  doğrulandı.
- [ ] Hedef kitle ve çocuk politikası kararı tamamlandı.

### Doğrulamada kullanılan resmî kaynaklar

- [Google Play User Data politikası](https://support.google.com/googleplay/android-developer/answer/10144311)
- [Google Play Data safety rehberi](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Google Play abonelik politikası](https://support.google.com/googleplay/android-developer/answer/9900533)
- [RevenueCat — Data collected by RevenueCat](https://www.revenuecat.com/docs/technical-resources/data-collected-by-revenuecat)
- [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy/)
