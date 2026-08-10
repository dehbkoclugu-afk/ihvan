# İhvan Android gerçek cihaz kabul protokolü

Bu protokol, Play internal/closed test kanalından yüklenen yayın adayını gerçek Android cihazlarda kabul etmek için kullanılır. Test edilen APK, imzalı AAB ile aynı commit ve yapılandırmadan üretilmiş olmalıdır. Her matris satırı ayrı ayrı `PASS` veya `FAIL` olarak kapatılmalıdır; boş, `N/A` ya da yalnızca sözlü onay tamamlanmış test sayılmaz.

## Test kaydı

- Release commit SHA:
- GitHub Actions workflow URL:
- AAB SHA-256:
- Signed APK SHA-256:
- Play track ve release ID:
- Test başlangıcı (ISO 8601, saat dilimiyle):
- Test bitişi (ISO 8601, saat dilimiyle):
- Test sorumlusu:
- Lisans test hesabı aliası (e-posta/parola yazmayın):

En az iki fiziksel cihaz kullanın: biri Android 13+ (API 33+) ve biri desteklenen daha eski bir Android sürümü. Mümkünse cihazlardan biri pusula sensörü olmayan ya da sensörü devre dışı bırakılabilen bir model olmalıdır.

| Cihaz etiketi | Üretici/model | Android sürümü | API | Ekran boyutu | Sensör notu |
|---|---|---|---|---|---|
| D1 |  |  |  |  |  |
| D2 |  |  |  |  |  |

## Sonuç yazım kuralı

- **Result:** Yalnızca `PASS` veya `FAIL — <defect ID>` yazın.
- **Evidence:** Her satırda cihaz etiketi, test zamanı ve SHA-256 ile ilişkilendirilebilen ekran görüntüsü/video/log bağlantısı bulunmalıdır.
- Bir `FAIL` için defect kaydına tekrar adımlarını, beklenen ve gerçekleşen sonucu, cihaz/modeli, Android/API sürümünü, uygulama sürümü/versionCode'u, önem derecesini ve ekran görüntüsü ya da videoyu ekleyin.
- Kanıtlarda parola, API anahtarı, service-account içeriği, ham satın alma makbuzu/token'ı veya kişisel günlük metni bulunmamalıdır. Lisans test kullanıcısını yalnızca alias ile belirtin.

## QA matrix

### Clean install

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| CI-01 | D1 / API 33+ | İhvan kaldırılmış; uygulama verisi yok; yayın adayı Play test kanalında mevcut. | Play üzerinden kur; ilk kez aç; isteğe bağlı ad gir; **Bugün başla**'ya dokun; uygulamayı kapatıp yeniden aç. | Kurulum ve ilk açılış çökmeden tamamlanır; onboarding yalnızca ilk açılışta görünür; ana sekme açılır; kaydedilen ad korunur; yeniden açılış onboarding'e dönmez. |  |  |
| CI-02 | D2 / desteklenen eski API | İhvan kaldırılmış; uygulama verisi yok. | Yayın adayını kur; ilk kez aç; adı boş bırakıp onboarding'i tamamla; süreçten çıkmaya zorla ve yeniden aç. | Boş ad kabul edilir; uygulama kullanılabilir ana ekrana geçer; süreç yeniden başladığında uygulama açılır ve onboarding tekrarlanmaz. |  |  |

### Quran integrity

Kur’an metninde beklenmeyen fark, eksik/fazla sûre veya ayet, bozuk sıralama ya da boş Arapça metin **NO-GO** nedenidir. Bu kontrol metni yeniden yazmayı değil, yayın adayındaki paketlenmiş içeriğin görünür bütünlüğünü doğrular.

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| QR-01 | D1 / herhangi | Temiz onboarding tamamlanmış. | Kur’an sekmesini aç; sûre listesinin başını ve sonunu kontrol et; 1. Fâtiha'yı ve 114. Nâs'ı aç; ilk/son ayete kaydır. | Ekran 114 sûre ve 6.236 ayet bilgisini gösterir; sûre numaraları/sırası doğru görünür; Fâtiha 7, Nâs 6 ayettir; Arapça metin boş, kesilmiş veya bozuk değildir. |  |  |
| QR-02 | D1 / herhangi | Kur’an sekmesi açık. | Sûre adıyla arama yap; sûre numarasıyla arama yap; `2:255` yazıp doğrudan ayete git; aramayı temizle. | İsim ve numara doğru sûreyi filtreler; doğrudan ayet sonucu Bakara 2:255'i açar; temizleme tam sûre listesini geri getirir. |  |  |
| QR-03 | D1 / herhangi | Kur’an sekmesi açık. | **Sûreler** modunda ortadan bir sûre aç ve geri dön; **Cüzler** moduna geç; 1. ve 30. cüzü ayrı ayrı açıp içerikte kaydır. | Her iki gezinme modu çalışır; seçilen sûre/cüz doğru başlık ve ayetlerle açılır; 30 cüz listelenir; geri dönüş uygulamayı bozmaz. |  |  |
| QR-04 | D2 / herhangi | Kur’an sekmesi açık. | Bir sûreyi aç; bir ayeti okundu işaretle ve yer imine ekle; farklı bir ayete kaydır/gez; uygulamayı süreçten sonlandırıp yeniden aç; **Kaldığın yer** ve **Yer imleri** üzerinden ayetleri aç. | Okundu durumu, yer imi ve son okunan konum yeniden başlatmadan sonra korunur; kısayollar tam olarak kaydedilen ayetlere gider; veri kaybı veya yinelenen yer imi oluşmaz. |  |  |

### Location

Yalnızca foreground location izni test edilir; uygulama arka plan konum izni istememelidir.

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| LO-01 | D1 / API 33+ | Konum izni verilmemiş; cihaz konumu açık. | İbadet ekranında **Konumumu kullan**'a dokun; uygulama kullanımdayken konum iznini ver. | Yalnızca uygulamayı kullanırken konum izni istenir; konum etiketi, namaz vakitleri ve kıble görünür; arka plan konum izni istenmez. |  |  |
| LO-02 | D2 / herhangi | Uygulamanın konum izni yok. | **Konumumu kullan**'a dokun; izin istemini reddet; İbadet ekranında gezinmeye devam et. | Uygulama çökmez veya boş ekranda kalmaz; anlaşılır hata/izin açıklaması gösterir; konumsuz diğer özellikler kullanılabilir kalır. |  |  |
| LO-03 | D1 / API 33+ | Konum daha önce verilmiş ve vakitler görünür. | Android Ayarlar'dan İhvan konum iznini kaldır; uygulamaya dön veya yeniden aç; tekrar konum istemeyi dene; gerekiyorsa **Konum ayarlarını aç** akışını kullan. | Eski konum sessizce güvenilir kabul edilmez; izin kaybı kontrollü gösterilir; ayarlar bağlantısı doğru uygulama ayarını açar; izin yeniden verilince vakit/kıble geri gelir. |  |  |

### Qibla

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| QB-01 | Pusula sensörü olmayan/devre dışı D2 | Foreground location verilmiş; namaz vakitleri görünür. | Kıble kartını aç; derece değerini kaydet; **Canlı pusulayı aç**'a dokun; karttan çıkıp geri dön. | Kuzeye göre kıble açısı sensör olmadan da görünür; sensör okunamazsa açık bir uyarı gösterilir; uygulama çökmez, kilitlenmez ve temel kıble açısı kaybolmaz. |  |  |
| QB-02 | Pusula sensörlü D1 | Foreground location verilmiş. | **Canlı pusulayı aç**; telefonu düz tutup yavaşça döndür; pusulayı durdur. | Ok yönü cihaz yönelimine tepki verir; derece değeri sonlu ve sabittir; başlat/durdur tekrarlanabilir ve ekrandan çıkınca sensör kullanımı takılı kalmaz. |  |  |

### Notifications

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| NO-01 | D1 / API 33+ | Bildirim izni verilmemiş; foreground location verilmiş. | Vakit bildirimlerini aç; Android bildirim iznini ver; bir veya daha fazla namaz seç; hatırlatma zamanını değiştir. | Android 13+ runtime bildirim izni görünür; onay sonrası arayüz bildirimleri açık gösterir ve seçili vakitleri 10 gün için planlar; çift izin istemi veya çökme olmaz. |  |  |
| NO-02 | D1 / API 33+ | Bildirim izni verilmemiş veya Ayarlar'dan kaldırılmış. | Vakit bildirimlerini aç; izin istemini reddet; tekrar dene; sunulursa **Bildirim ayarlarını aç**'a dokun. | Reddetme kontrollü hata üretir ve açık durumu yanlışlıkla kalıcılaştırmaz; ayarlar bağlantısı doğru uygulama bildirim ayarını açar; uygulamanın geri kalanı kullanılabilir kalır. |  |  |
| NO-03 | D1 / API 33+ | Bildirimler açık; en az iki vakit seçili. | Seçili namazları, hatırlatma dakikasını ve/veya konumu değiştir; uygulamayı arka plana alıp geri getir; yeniden aç. | Eski plan geçersizleştirilir ve yeni ayarlara göre tek bir güncel plan oluşturulur; arayüz seçimi korunur; yinelenen bildirim veya eski saate göre bildirim gözlenmez. |  |  |
| NO-04 | D2 / herhangi | Bildirimler açık ve test vaktine göre plan yapılmış. | Uygulamayı arka plana al; süreçten sonlandır; planlanan yerel bildirimi bekle; bildirime dokun. | Bildirim uygulama kapalıyken gelir; başlık/saat seçilen vakitle uyumludur; dokunma İbadet ekranını açar; çökme veya yinelenen bildirim yoktur. |  |  |

### Local habit persistence

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| HP-01 | D2 / herhangi | Onboarding tamamlanmış. | Bugünün namazlarından en az ikisini tamamlandı işaretle; bir zikir sayacı ilerlet; günlükte ayırt edilebilir test kaydı oluştur; günlük ritüelde bir adımı tamamla; uygulamayı süreçten sonlandırıp yeniden aç. | Namaz, zikir, günlük ve ritüel durumları yeniden başlatmada korunur; istatistikler yeni yerel durumla uyumludur; kayıtlar sıfırlanmaz veya çoğalmaz. |  |  |

### Data export

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| DE-01 | D1 / API 33+ | Profil, namaz, Kur’an, günlük, zikir ve ritüelde ayırt edilebilir test verisi var. | Profil > **Verilerimi dışa aktar**; paylaşım menüsünden JSON'u güvenli test hedefine kaydet; dosyayı açıp üst düzey alanları ve test verisini kontrol et. | Geçerli, okunabilir JSON üretilir; beklenen yerel ilerleme/not alanları bulunur; arayüz başarı mesajı verir; uygulama donmaz; sırlar, satın alma makbuzu/token'ı veya cihaz konumu dışa aktarılmaz. |  |  |
| DE-02 | D1 / API 33+ | DE-01 tamamlanmış. | Dışa aktarmayı tekrar başlat; Android paylaşım menüsünü hedef seçmeden iptal et; uygulamaya dön; işlemi yeniden dene; uygulamanın cache/share alanını cihaz araçlarıyla kontrol et. | İptal çökme ya da takılı yüklenme durumu oluşturmaz; yeniden dışa aktarma çalışır; geçici paylaşım dosyaları sınırsız birikmez ve sistem/uygulama temizleme davranışıyla kaldırılabilir; kullanıcı verisi uygulama dışına kendiliğinden gönderilmez. |  |  |

### Accessibility

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| AC-01 | D1 / API 33+ | Android yazı boyutu en büyük desteklenen değerde; ekran büyütme kapalı. | Onboarding, Bugün, Kur’an sûre/cüz listesi, bir sûre ayrıntısı, İbadet, paywall ve Profil ekranlarını dolaş; temel eylemleri tamamla. | Ana içerik ve eylemler erişilebilir/kaydırılabilir kalır; metin üst üste binmez veya kritik düğmeleri ekran dışına kilitlemez; Arapça ayet okunabilir; satın alma fiyatı/eylemi anlaşılırdır. |  |  |
| AC-02 | D2 / herhangi | TalkBack açık; ekran perdesi gerekmez. | Onboarding'i tamamla; alt sekmeleri dolaş; sûre ve ayet aç; yer imi ekle; namaz tamamla; bildirim anahtarını ve paywall restore düğmesini odağa al. | Odak sırası anlamlıdır; tüm temel kontroller rol, etiket ve seçili/işaretli durumuyla okunur; etiketsiz kritik düğme yoktur; TalkBack ile eylemler tetiklenebilir ve odak tuzağı oluşmaz. |  |  |

### Offline

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| OF-01 | D2 / herhangi | Onboarding tamamlanmış; en az bir yer imi, son okuma ve yerel alışkanlık kaydı var; uygulama kapalı. | Uçak modunu aç; uygulamayı soğuk başlat; Bugün, Kur’an, sûre/cüz, yer imleri, İbadet, Günlük ve Profil ekranlarını aç; yerel bir değişiklik yap; süreci sonlandırıp çevrimdışı yeniden aç. | Uygulama çevrimdışı açılır; paketlenmiş Kur’an içeriği ve mevcut yerel veriler kullanılabilir; yeni yerel değişiklik yeniden açılışta korunur; ağsız durum çökme, sonsuz yükleme veya veri kaybı üretmez. |  |  |
| OF-02 | D1 / API 33+ | Uçak modu açık; kullanıcı Plus değil. | Paywall'u aç; plan yükleme/satın alma/restore davranışını gözle; iptal veya geri dönüş yap. | Ağ/mağaza erişimi yokken yanlış Plus yetkisi verilmez; kullanıcıya kontrollü erişilemiyor/tekrar dene sonucu gösterilir; uygulama çökmez ve temel ücretsiz akışlara dönülebilir. |  |  |

### Purchase

Gerçek ürünleri yalnızca Play license tester hesabıyla ve internal/closed-test kurulumunda test edin. Ham makbuz veya purchase token'ı kanıta eklemeyin.

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| PU-01 | D1 / API 33+ | Play license tester oturumu açık; Plus etkin değil; ağ açık; aylık/yıllık planlar görünür. | Bir plan için satın almayı başlat; Google Play ödeme sayfasında iptal et; paywall'a dön; uygulamayı yeniden aç. | İptal başarı sayılmaz; ücret/yetki verilmez; anlaşılır iptal durumu gösterilir; düğmeler yeniden kullanılabilir; uygulama çökmez veya yüklenmede kalmaz. |  |  |
| PU-02 | D1 / API 33+ | Play license tester oturumu açık; Plus etkin değil; ağ açık. | Desteklenen aylık veya yıllık planı satın al; Play test işlemini tamamla; Plus alanına gir; uygulamayı süreçten sonlandırıp yeniden aç; RevenueCat müşteri kaydını kontrol et. | Play işlemi başarılı olur; `ihvan_plus` aktif hale gelir; ücretli içerik hemen açılır ve yeniden başlatmada açık kalır; RevenueCat'te doğru ürün/entitlement ve işlem zamanı görünür; çift satın alma oluşmaz. |  |  |

### Restore

| ID | Device/API | Precondition | Actions | Expected result | Result | Evidence |
|---|---|---|---|---|---|---|
| RS-01 | D1 / API 33+ | PU-02 aynı Play license tester ile tamamlanmış; işlem RevenueCat'te görünür. | Android Ayarlar'dan İhvan uygulama verisini temizle; uygulamayı açıp onboarding'i tamamla; paywall'da **Satın alımları geri yükle**'ye dokun; uygulamayı yeniden aç. | Yerel verinin temizlendiği açıkça gözlenir; restore yeniden ücret almadan aynı test hesabının `ihvan_plus` yetkisini geri getirir; ücretli alan açılır ve yeniden başlatmada korunur; restore çökmez veya sonsuz beklemez. |  |  |
| RS-02 | D2 / herhangi | Bu cihazdaki Play hesabında İhvan satın alımı yok; Plus etkin değil. | **Satın alımları geri yükle**'ye dokun. | Yetki verilmez ve ücret alınmaz; satın alım bulunmadığı anlaşılır biçimde belirtilir; uygulama kullanılabilir kalır. |  |  |

## Evidence

Her test çalışmasının kanıt paketi aşağıdakileri içermelidir:

1. Bu belgenin doldurulmuş bir kopyası; her satırda `PASS` veya `FAIL — <defect ID>`.
2. Yayın commit SHA'sı, workflow URL'si, Play release ID/versionCode, AAB SHA-256 ve testte kullanılan signed APK SHA-256.
3. Her satır için cihaz etiketi/modeli, Android sürümü/API ve saat dilimli test zamanı.
4. Görsel akışlarda ekran görüntüsü; zamanlama, yeniden başlatma, izin, satın alma ve restore gibi çok adımlı akışlarda kısa ekran kaydı veya adım adım ekran görüntüleri.
5. Satın alma başarısı için Play test işlemi zamanı/ürün kimliği ve RevenueCat müşteri kaydında `ihvan_plus` doğrulaması; yalnızca alias/redakte edilmiş görüntü kullanın.
6. Bildirim testlerinde planlanan vakit/hatırlatma ayarı ile alınan bildirimin cihaz zamanını birlikte gösteren kanıt.
7. Her hata için defect bağlantısı, önem derecesi, kesin tekrar adımları, gerçekleşen sonuç ve ilgili logcat bölümü (varsa).

Kanıtları release ID altında değiştirilemez ya da sürüm geçmişi tutan ortak bir klasörde saklayın. Kanıt dosyası adlarında test ID, cihaz etiketi ve UTC zamanını kullanın; örnek: `QR-04_D2_20260810T204500Z.mp4`. Uygulama yeniden build edilirse SHA-256 değişir ve tüm cihaz/billing kabul sonuçları yeni aday için tekrar çalıştırılır.

## Severity

| Seviye | Tanım | Örnek | Yayın etkisi |
|---|---|---|---|
| **Blocker** | Kurulum, açılış, ödeme veya geri yükleme yapılamıyor; veri kaybı/bozulması var; güvenli bir geçici çözüm yok. | Yayın adayı kurulmuyor, açılışta çöküyor, başarılı ödeme yetki vermiyor, restore ücretli hakkı getirmiyor, kullanıcı verisi siliniyor. | Derhal **NO-GO**; düzeltilip yeni build ile tüm etkilenen testler tekrarlanır. |
| **Critical** | Temel Kur’an veya namaz akışı bozuk ya da yanlış sonuç üretiyor. | Ayet/sûre/cüz yanlış veya açılamıyor, Kur’an bütünlüğü şüpheli, namaz vakitleri/kıble kullanılamıyor, temel yerel bildirim akışı çalışmıyor. | **NO-GO**; açık bırakılamaz. |
| **Major** | Akış kullanılabilir fakat maddi ölçüde bozulmuş; kullanıcı önemli sürtünme veya sınırlama yaşar. | İzin reddinden dönüş zor, büyük yazıda önemli içerik kesiliyor, paylaşım iptalinden sonra tekrar deneme gerektiriyor. | Sahibi ve hedef sürümü yazılır; ödeme/veri kaybı etkisi varsa Blocker'a yükseltilir. Yayın kararı belgeli ürün onayı ister. |
| **Minor** | İşlevi veya doğruluğu etkilemeyen kozmetik sorun. | Küçük hizalama, kırpılmayan fakat ideal olmayan boşluk, önemsiz renk/tipografi tutarsızlığı. | 1.0.1'e ertelenebilir; defect kaydı zorunludur. |

## Exit rules

Yayın adayı yalnızca aşağıdaki koşulların tamamında gerçek cihaz QA açısından **GO** alır:

- Matrisin tüm satırları doldurulmuş ve gerekli kanıtla ilişkilendirilmiştir.
- Açık **Blocker** veya **Critical** sonucu sıfırdır.
- Kurulum/açılışta çökme, temel akışlarda veri kaybı ve Kur’an bütünlüğü hatası yoktur.
- Purchase success, purchase cancellation ve app-data-clear sonrası Restore aynı yayın adayında kanıtlanmıştır.
- Android 13+ bildirim izni ile grant/deny akışları ve foreground Location grant/deny/revoke akışları tamamlanmıştır.
- Açık Major sorunların ödeme veya kullanıcı verisi kaybı etkisi olmadığı doğrulanmış, sahibi/hedef sürümü atanmış ve yazılı ürün onayı alınmıştır.

Herhangi bir zorunlu satırın eksik kanıtı, SHA-256 uyuşmazlığı, açık Blocker/Critical hata, ödeme/restore belirsizliği, veri kaybı veya Quran integrity başarısızlığı **NO-GO** demektir.
