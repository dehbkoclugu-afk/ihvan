# İhvan Android yayın kontrol listesi

Bu liste İhvan 1.0.0 Android yayınında tek go/no-go kapısıdır. Her madde
kanıtlanmadan işaretlenmez; ilgili olmayan madde atlanmaz. Parola, API anahtarı,
service-account içeriği veya ham purchase receipt bu dosyaya yazılmaz.

## Yayın kanıtları

- Release commit SHA:
- GitHub Actions workflow URL:
- AAB SHA-256:
- versionCode:
- Play release ID:
- Test edilen cihazlar ve Android sürümleri:
- Test purchaser account alias:
- Purchase timestamp:
- RevenueCat customer record confirmation:

## Phase 0 — Yayın tabanını kilitle

- [ ] `app.json` ve `package.json` sürümü `1.0.0`.
- [ ] Android package `com.ihvan.quran`.
- [ ] Release commit SHA kaydedildi ve çalışma ağacı temiz.
- [ ] Kur'an kaynakları veya üretilmiş Kur'an verileri değiştirilmedi.
- [ ] `npm test`, `npm run typecheck`, `npm run lint` ve `git diff --check` geçti.
- [ ] Expo public config sürümü ve package değerini doğruluyor.
- [ ] Expo Doctor kontrolleri geçti.

## Phase 1 — Play ve RevenueCat sözleşmesini doğrula

- [ ] `PLAY_CONSOLE_VALUES.md` içindeki tüm kurulum maddeleri tamamlandı.
- [ ] Yalnız `ihvan_plus_monthly` ve `ihvan_plus_annual` ürünleri sunuluyor.
- [ ] RevenueCat `default` offering içindeki `$rc_monthly` ve `$rc_annual`
      eşlemeleri doğru.
- [ ] Her iki ürün de yalnız `ihvan_plus` entitlement'ını veriyor.
- [ ] Google Play service account bağlantısı çalışıyor.
- [ ] Google Play license tester hesabı iç/internal veya closed test build'ine erişiyor.
- [ ] Play Data safety beyanları yayın adayının gerçek davranışıyla eşleşiyor.

## Phase 2 — İmzalı adayı üret

- [ ] `Android Signed Release` açıkça onaylandı.
- [ ] versionCode, Play Console'daki mevcut en yüksek değerden büyük.
- [ ] Workflow test, lint, typecheck, secret ve native-config kapılarını geçti.
- [ ] AAB ve APK aynı release commit'inden üretildi.
- [ ] İmza doğrulaması geçti; signing mismatch yok.
- [ ] İmzalı APK emülatör smoke testinden geçti.
- [ ] Workflow URL ve AAB SHA-256 kaydedildi.
- [ ] AAB değiştirilmeden Play internal testing'e yüklendi.

## Phase 3 — Gerçek cihaz kabul testi

- [ ] `ANDROID_DEVICE_QA.md` matrisi internal/closed-test build'iyle tamamlandı.
- [ ] Clean install, onboarding ve offline launch geçti.
- [ ] Kur'an bütünlüğü, sûre/cüz/ayet navigasyonu, yer imi ve son okuma geçti.
- [ ] Konum izin ver/ret/revoke, namaz vakitleri ve sensörsüz kıble geçti.
- [ ] Android 13+ bildirim izni ve namaz bildirimi yeniden planlama geçti.
- [ ] Yerel ibadet/günlük verisi ve JSON dışa aktarma temizliği geçti.
- [ ] Büyük yazı ve ekran okuyucu kontrolleri geçti.
- [ ] Sıfır açık Blocker veya Critical kusur var.

## Phase 4 — Gerçek faturalama testi

- [ ] License tester ile RevenueCat purchase başarıyla tamamlandı.
- [ ] Purchase sonrasında `ihvan_plus` erişimi açıldı.
- [ ] Purchase timestamp ve test purchaser account alias kaydedildi.
- [ ] RevenueCat customer record confirmation kaydedildi.
- [ ] Kullanıcı iptali uygulamayı bozmadı veya yanlış premium erişimi vermedi.
- [ ] Uygulama verisi temizlendikten sonra restore erişimi geri getirdi.
- [ ] Offering/ağ kullanılamadığında güvenli fallback davranışı doğrulandı.
- [ ] Ham makbuz veya gizli değer hiçbir kanıta yazılmadı.

## Phase 5 — Play yayın kapıları

- [ ] Store listing metinleri, ikon, feature graphic ve ekran görüntüleri tamamlandı.
- [ ] Content rating, App access, Ads, Target audience ve Data safety formları tamamlandı.
- [ ] Play pre-launch report incelendi; uygulanabilir sorunlar kapatıldı.
- [ ] Zorunlu closed-test koşulu ve hesap özelindeki diğer Play şartları tamamlandı.
- [ ] Play release ID kaydedildi.
- [ ] Kullanıcıya dönük gizlilik açıklamaları Console beyanlarıyla tutarlı.
- [ ] Son release adayı için yeni bir politika, izin veya signing mismatch yok.

## Phase 6 — Karar, staged rollout ve izleme

- [ ] Aşağıdaki GO kurallarının tamamı sağlandı ve yayın kararı kaydedildi.
- [ ] Doğrulanmış AAB production'a yüzde 10 staged rollout ile çıkarıldı.
- [ ] İlk 24 saat temizse staged rollout yüzde 50'ye yükseltildi.
- [ ] Sonraki 24–48 saat temizse rollout yüzde 100'e yükseltildi.
- [ ] Android vitals, crash/ANR, Play yorumları, RevenueCat purchase/restore
      olayları ve destek mesajları 72-hour monitoring boyunca izlendi.
- [ ] Payment, veri kaybı, install, launch veya Kur'an bütünlüğü hatasında rollout
      durdurma koşulu uygulandı.
- [ ] Kritik olmayan kusurlar 1.0.1 kapsamına taşındı.

## GO / NO-GO kararı

**GO** yalnız şu koşulların tamamında verilir: otomatik kontroller, imzalı build
smoke testi, gerçek cihaz QA, RevenueCat purchase, restore, Console beyanları,
Play pre-launch report ve zorunlu Play testleri başarıyla tamamlanmıştır.

**NO-GO** şu durumlardan herhangi birinde zorunludur: payment kanıtı eksikliği,
Kur'an bütünlüğü hatası, açık Blocker/Critical kusur, signing mismatch, politika
uyuşmazlığı veya yukarıdaki zorunlu kapılardan birinin atlanması. Sorun dar
kapsamlı bir düzeltmeyle giderilir, versionCode artırılır, aday yeniden üretilir
ve etkilenen kabul testleri tekrarlanır.

- Nihai karar: GO / NO-GO
- Karar zamanı:
- Kararı veren:
- Karar notu:
