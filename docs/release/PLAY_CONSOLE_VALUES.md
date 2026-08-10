# Play Console ve RevenueCat yayın değerleri

Bu belge İhvan Android 1.0.0 yayını için kopyalanabilir kimlikleri ve iki
konsolda tamamlanacak işlemleri tanımlar. API anahtarı, parola, service-account
JSON'u veya satın alma makbuzu bu belgeye yazılmaz.

## Kanonik değerler

| Alan | Değer |
|---|---|
| Android package | `com.ihvan.quran` |
| RevenueCat entitlement | `ihvan_plus` |
| Aylık Google Play product ID | `ihvan_plus_monthly` |
| Yıllık Google Play product ID | `ihvan_plus_annual` |
| RevenueCat aylık package | `$rc_monthly` |
| RevenueCat yıllık package | `$rc_annual` |
| RevenueCat offering | `default` |

Desteklenen planlar yalnızca `monthly` ve `annual` planlarıdır. Lifetime ürün
oluşturulmaz ve offering'e eklenmez.

## Google Play Console kurulumu

1. Package adı `com.ihvan.quran` olan uygulamayı aç.
2. `ihvan_plus_monthly` aboneliğini oluştur, aylık base planı ve satış
   bölgelerindeki fiyatları etkinleştir.
3. `ihvan_plus_annual` aboneliğini oluştur, yıllık base planı ve satış
   bölgelerindeki fiyatları etkinleştir.
4. RevenueCat için gereken en düşük yetkilere sahip Google Play service account
   erişimini tanımla ve uygulamaya bağla.
5. Bir Google Play license tester hesabı tanımla; gerçek QA sırasında yalnız bu
   hesapla test satın alımı yap.
6. Ürünlerin etkin, test kanalındaki build'in erişilebilir ve license tester'ın
   test kullanıcısı listesinde olduğunu doğrula.

## RevenueCat kurulumu

1. Android app package değerini `com.ihvan.quran` olarak tanımla.
2. Google Play service account bağlantısının geçerli olduğunu doğrula.
3. `ihvan_plus_monthly` ve `ihvan_plus_annual` ürünlerini içe aktar.
4. `ihvan_plus` entitlement'ını oluştur ve iki ürünü de bu entitlement'a bağla.
5. `default` offering içinde `$rc_monthly` paketini `ihvan_plus_monthly`,
   `$rc_annual` paketini `ihvan_plus_annual` ürününe bağla.
6. `default` offering'i current offering olarak yayımla.
7. License tester ile aylık veya yıllık satın alma yaptıktan sonra RevenueCat
   customer kaydında `ihvan_plus` entitlement'ının aktif olduğunu doğrula.
8. Uygulama verisini temizleyip restore çalıştır; aynı entitlement'ın yeniden
   etkinleştiğini doğrula.

## Play politika beyanları

- **Foreground location:** Namaz vakitleri ve kıble için cihaz üzerinde
  kullanılır.
- **Background location: not used:** Uygulama arka plan konumu istemez veya
  toplamaz.
- **Bildirimler:** Namaz bildirimleri yereldir ve kullanıcı tarafından opt-in
  olarak açılır.
- **Kişisel içerik:** Günlük ve ibadet alışkanlığı verileri cihazda yerel kalır;
  yalnız kullanıcı açıkça dışa aktardığında cihaz dışına çıkar.
- **Purchase data:** Satın alma verisi Google Play ve RevenueCat tarafından
  abonelik sağlama, doğrulama ve restore işlemleri için işlenir.

Gönderimden hemen önce bu beyanlar Play Console'daki güncel Data safety formu,
uygulamanın izinleri ve yayın adayının gerçek davranışıyla tek tek
uzlaştırılmalıdır. Bir tutarsızlık varsa formu veya uygulamayı düzeltmeden
yayına devam edilmez.

## Tamamlama kontrolü

- [ ] Package adı `com.ihvan.quran` olarak doğrulandı.
- [ ] `ihvan_plus_monthly` etkin ve RevenueCat'e bağlı.
- [ ] `ihvan_plus_annual` etkin ve RevenueCat'e bağlı.
- [ ] `$rc_monthly` ve `$rc_annual`, `default` offering içinde doğru ürünlere bağlı.
- [ ] Her iki ürün de `ihvan_plus` entitlement'ını veriyor.
- [ ] Google Play service account bağlantısı çalışıyor.
- [ ] Google Play license tester hesabı test kanalına erişebiliyor.
- [ ] Satın alma ve restore sonucu RevenueCat customer kaydında doğrulandı.
- [ ] Data safety beyanları yayın adayıyla uzlaştırıldı.
