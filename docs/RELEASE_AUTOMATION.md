# İhvan release otomasyonu

Release workflow'ları üç ayrı güven sınırıyla çalışır. Hiçbiri secret değerini
repoya yazmaz veya başka bir projeden taşımaya çalışmaz.

## Android Preview APK

`Android Preview APK` workflow'u secret gerektirmez. Expo native projelerini
yeniden üretir, foreground-only konum ve bildirim privacy guard'ını doğrular,
test/sideload amaçlı APK üretir ve Android 14 emülatöründe açılış smoke testi
çalıştırır. Artifact adı `ihvan-preview-apk` olur.

Workflow elle çalıştırılabilir. Ayrıca uygulama kaynakları, assetler veya
release config'i değişen `claude-code` pull request'lerinde otomatik çalışır.
Aynı branch'e yeni commit gelirse eski preview koşusu iptal edilerek gereksiz
runner kullanımı önlenir.

Bu APK store yayını için kullanılmaz; Expo şablonunun test imzasını kullanır.

## Android Signed Release

`Android Signed Release` workflow'u imzalı AAB ve APK üretir, her iki imzayı
doğrular ve APK'yı emülatörde açar. Gereken GitHub Actions secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`

Entitlement kimliği `ihvan_plus` olarak build ortamına verilir. Workflow elle
tetiklenir. İmzalı artifact üretimine izin vermek için `release_confirmed`
seçeneğinin açıkça işaretlenmesi zorunludur; işaretlenmeyen koşu ilk adımda
durur. İstenirse pozitif bir `version_code` girilebilir; boş bırakılırsa
workflow run numarası kullanılır.

Operatör sırası:

1. Play Console'da kullanılan en yüksek `versionCode` değerini kontrol et.
2. Bu değerden büyük, pozitif bir `version_code` seç.
3. Workflow'u başlatırken `release_confirmed` seçeneğini işaretle.
4. Başarılı koşudan `ihvan-signed-aab` artifact'ini indir ve AAB dosyasının
   SHA-256 özetini kaydet (örneğin `sha256sum app-release.aab`).
5. Aynı AAB dosyasını önce Play Console internal testing kanalına yükle.
6. Workflow run URL'sini, SHA-256 özetini ve kullanılan `versionCode` değerini
   yayın kanıtlarıyla birlikte sakla.

## EAS Build and Submit

`EAS Build and Submit` workflow'u preview/production EAS build'lerini ve isteğe
bağlı mağaza gönderimini yürütür. Gereken secrets:

- `EXPO_TOKEN`
- `EXPO_PROJECT_ID`
- Production Android build için `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
- Production iOS build için `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- Android submit için `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

Project ID workflow sırasında geçici olarak `app.json` içine yazılır; kaynak
branch'e commit edilmez. Play service-account JSON'u yalnız submit sırasında
geçici dosyaya yazılır, JSON olarak doğrulanır, izinleri sınırlandırılır ve
workflow sonunda silinir.

İlk güvenli sıra:

1. `Android Preview APK` çalıştır ve APK/smoke artifact'lerini doğrula.
2. Signing secrets hazırsa `Android Signed Release` çalıştır.
3. EAS secrets hazırsa `platform=android`, `profile=preview`, `submit=false` ile çalıştır.
4. Store ürünleri ve RevenueCat offering/entitlement eşlemesi doğrulandıktan sonra production build al.
5. Internal testing ve gerçek cihaz QA tamamlandıktan sonra `submit=true` kullan.

iOS'un ilk signing kurulumu Apple hesabı ve sertifika seçimi gerektirebilir.
Signed build ve emülatör smoke testi fiziksel cihaz QA'nın yerine geçmez.
