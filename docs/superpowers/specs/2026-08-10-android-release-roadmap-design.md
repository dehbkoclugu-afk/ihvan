# İhvan Android Yayın Roadmap'i

## Hedef

İhvan'ın doğrulanmış MVP'sini yeni özellik eklemeden Google Play üretimine
taşımak. İlk yayın; gerçek cihazda çalışan, satın alma ve geri yükleme akışları
doğrulanmış, mağaza formları tamamlanmış ve geri dönüş planı bulunan Android
1.0.0 sürümü olacaktır.

Tahmini süre: dış hesap ve inceleme beklemeleri hariç 7–12 çalışma günü.

## Yayın ilkeleri

- İlk sürümde kapsam büyütülmez. Yalnız yayın engelleyici hata, politika sorunu
  veya ciddi kullanılabilirlik problemi düzeltilir.
- Kur'an metni, meal, tefsir ve dua içeriği otomatik çevrilmez veya sessizce
  değiştirilmez.
- Satın alma gerçek Play test hesabında doğrulanmadan üretime çıkılmaz.
- Preview APK başarı ölçütü değildir; üretimde kullanılacak imzalı AAB ayrıca
  doğrulanır.
- Paket adı com.ihvan.quran yayın öncesinde kilitlenir.

## Faz 0 — Yayın tabanını kilitleme

Süre: yarım gün.

1. claude-code dalındaki son commit yayın tabanı olarak kaydedilir.
2. Açık PR ve bekleyen release değişikliği olmadığı doğrulanır.
3. app.json ve package.json sürümleri 1.0.0 olarak eşitlenir.
4. Android versionCode başlangıç değeri belirlenir.
5. Paket adı, uygulama adı, ikon, adaptive icon, notification icon ve splash
   referansları kontrol edilir.
6. Temiz kurulumla test, typecheck, lint, Expo Doctor, Quran integrity,
   public config, web export ve native prebuild kontrolleri çalıştırılır.

Çıkış kriteri: Tek bir yayın commit'i, temiz çalışma ağacı ve tüm otomatik
kontrollerin başarılı olması.

## Faz 1 — Play ürünleri ve RevenueCat

Süre: 1–2 gün.

1. Google Play Console'da uygulama com.ihvan.quran paketiyle açılır.
2. İlk sürüm için sade ürün yapısı kullanılır: aylık ve yıllık abonelik.
   Lifetime yalnız mevcut paywall ve ürün mantığı gerçekten destekliyorsa eklenir.
3. Ürün kimlikleri kod, Play Console ve RevenueCat arasında bire bir eşleştirilir.
4. RevenueCat Android uygulaması Play Console hizmet hesabına bağlanır.
5. Entitlement adı ihvan_plus olarak korunur.
6. Default offering içine yayınlanacak paketler eklenir.
7. EXPO_PUBLIC_REVENUECAT_ANDROID_KEY production build secret'ı olarak
   tanımlanır; repoya yazılmaz.
8. Eksik offering, ağ hatası ve iptal edilen satın alma durumlarında uygulamanın
   kilitlenmediği kontrol edilir.

Çıkış kriteri: Play lisans test hesabında ürünler paywall'da gerçek yerel
fiyatlarıyla görünür.

## Faz 2 — Gerçek cihaz kabul testi

Süre: 1–2 gün.

En az Android 10–12 aralığında bir cihaz ve Android 13–15 aralığında bir cihaz
kullanılır. Mümkün değilse ikinci cihaz bir cihaz test servisiyle karşılanabilir.

Kritik senaryolar:

1. Temiz kurulum, onboarding, tema seçimi ve yeniden açma.
2. Tam Kur'an veri bütünlüğü; sûre, cüz ve doğrudan ayet geçişleri.
3. Yer imi ekleme/silme, kaldığın yer ve günlük okuma hedefi.
4. Konum iznini kabul, reddetme ve sonradan kaldırma.
5. Namaz vakitleri, kıble ve pusula bulunmayan cihaz davranışı.
6. Bildirim izni, namaz seçimi ve hatırlatma zamanı.
7. Beş vakit takibi, geçmiş düzenleme, streak ve tarih sınırları.
8. Zikir, günlük, veri dışa aktarma ve paylaşım iptali.
9. Ekran okuyucu ve büyük yazı boyutunda temel akışlar.
10. Uçak modu, yavaş ağ, arka plana atma ve süreç sonlandırma.

Her hata için tekrar adımları, cihaz/Android sürümü, ekran görüntüsü ve önem
derecesi kaydedilir. Blocker ve critical hatalar yayını durdurur; major hatalar
ödeme veya kullanıcı kaybı etkisine göre değerlendirilir.

Çıkış kriteri: Açık blocker/critical hata, temel akışlarda veri kaybı veya çökme yok.

## Faz 3 — Gerçek satın alma kabul testi

Süre: 1 gün.

1. Kapalı test kanalına production RevenueCat anahtarlı imzalı AAB yüklenir.
2. Lisans test hesabıyla aylık veya yıllık ürün satın alınır.
3. ihvan_plus erişiminin uygulama yeniden açılınca korunduğu doğrulanır.
4. Uygulama verileri temizlenip aynı hesapla satın alımları geri yükleme denenir.
5. Kullanıcı ödeme ekranından vazgeçtiğinde hata gösterilmediği doğrulanır.
6. Ağ veya RevenueCat kesintisinde ücretsiz özelliklerin çalıştığı doğrulanır.
7. Test aboneliğinin yenilenme/sona erme davranışı RevenueCat'te kontrol edilir.

Çıkış kriteri: Satın alma, entitlement ve restore gerçek Play test işlemiyle
uçtan uca başarılıdır.

## Faz 4 — İmzalı paket ve kapalı test

Süre: 1 gün + Google'ın zorunlu test süresi.

1. Play App Signing etkinleştirilir; upload keystore güvenli biçimde yedeklenir.
2. GitHub Actions Android signing secret'ları tanımlanır.
3. Android Signed Release workflow'u ile AAB ve APK üretilir.
4. İmza, paket adı, sürüm, versionCode ve SDK değerleri kontrol edilir.
5. AAB internal test, ardından gerekiyorsa kapalı test kanalına gönderilir.
6. Play pre-launch report'taki çökme, ANR, erişilebilirlik ve uyumluluk
   bulguları incelenir.
7. Yalnız yayın engelleyici düzeltmeler release adayına alınır.

Çıkış kriteri: Play'in kabul ettiği imzalı AAB, başarılı pre-launch report ve
zorunlu test şartlarının tamamlanması.

## Faz 5 — Mağaza ve politika paketi

Süre: 1–2 gün.

Hazırlanacaklar:

- uygulama adı, kısa açıklama ve tam açıklama;
- ikon, feature graphic ve telefon ekran görüntüleri;
- destek e-postası ve yayımlanmış gizlilik politikası;
- Data safety, içerik derecelendirmesi ve reklam beyanları;
- uygulama erişimi, hedef kitle ve çocuklara yönelik içerik beyanları;
- konum ve bildirim izinlerinin kullanıcıya dönük açıklaması;
- abonelik fiyatı, otomatik yenileme ve iptal açıklaması.

Data safety formu gerçek davranışa göre doldurulur: foreground konum cihaz
üzerinde namaz vakti ve kıble hesabı için kullanılır; background location yoktur.
RevenueCat ve Play Billing'in işlediği satın alma verileri ayrıca beyan edilir.

Önerilen ekran görüntüsü sırası:

1. Günlük ayet ve rutin;
2. Kur'an okuyucu;
3. Namaz vakitleri;
4. Kıble;
5. Namaz takibi;
6. Zikir ve dua;
7. İlerleme ve geçmiş;
8. Gizlilik veya kişisel günlük.

Çıkış kriteri: Play Console'da zorunlu bölüm kalmaması ve mağaza vaatlerinin
uygulamanın gerçekten sunduklarıyla sınırlı olması.

## Faz 6 — Üretime çıkış

Süre: 1 gün + Google inceleme süresi.

1. Kapalı testte doğrulanan aynı AAB üretime terfi ettirilir.
2. Play izin veriyorsa ilk 24 saat yüzde 10, sonra yüzde 50 ve 24–48 saat
   içinde yüzde 100 kademeli dağıtım yapılır.
3. İlk 72 saatte Android vitals, crash/ANR, yorumlar, satın alma işlemleri ve
   RevenueCat entitlement olayları kontrol edilir.
4. Kritik ödeme veya veri kaybı probleminde rollout durdurulur; versionCode'u
   artırılmış hotfix AAB hazırlanır.
5. Kritik olmayan sorunlar 1.0.1 listesine alınır.

Çıkış kriteri: Yüzde 100 dağıtım, kabul edilebilir crash/ANR oranı ve doğrulanmış
en az bir production satın alma/restore akışı.

## Sorumluluk ayrımı

Kod ve otomasyon tarafı:

- sürüm/config eşitleme ve otomatik kontroller;
- release build ve hata düzeltmeleri;
- RevenueCat hata durumlarının güvenli davranışı.

Kullanıcı hesabı gerektiren taraf:

- Play Console uygulama ve ürün oluşturma;
- RevenueCat proje/ürün bağlantıları;
- signing ve hizmet hesabı secret'ları;
- lisans test hesabıyla gerçek satın alma;
- mağaza beyanlarının onayı ve üretime gönderim.

Console işlemleri başladığında her ekran için gerekli değerler kısa kontrol
listeleri halinde hazırlanacaktır.

## Yayın dışı bırakılanlar

- iOS yayını;
- yeni dil paketleri;
- yeni meal, tefsir veya dua kaynakları;
- sosyal özellikler veya hesap sistemi;
- analitik/deney altyapısı;
- MVP dışı yeni özellikler ve kapsamlı tasarım değişiklikleri.

## Başarı tanımı

- Play tarafından kabul edilmiş 1.0.0 production AAB;
- gerçek cihazlarda kritik akışların başarılı olması;
- gerçek Play test satın alma ve restore işleminin çalışması;
- açık blocker/critical hata bulunmaması;
- politika ve Data safety beyanlarının kod davranışıyla uyumlu olması;
- ilk 72 saat için izleme ve hotfix prosedürünün hazır olması.
