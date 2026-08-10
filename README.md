# İhvan

İhvan is a Turkish-first Quran habit companion built on the proven Expo/React Native core of Lumen, while keeping the product, repository, content and identity completely separate.

## MVP loop

- Daily ayah ritual and streak
- Full Arabic-first Quran reader with 114-surah / 30-juz navigation, direct ayah navigation, bookmarks and last-read progress
- Dua and dhikr practice
- Foreground-location prayer times with the Adhan Turkey calculation method
- Qibla bearing and optional live device compass
- Opt-in local prayer-time notifications with per-prayer selection (10-day rolling schedule)
- Private five-prayer daily completion tracking with editable history and 7/30/90-day progress views
- Private reflection journal
- Vigil/Dawn themes
- RevenueCat-ready subscription boundary

The complete Arabic Quran is bundled verbatim from the Tanzil Project Uthmani text (CC BY 3.0), with an integrity fingerprint and 114-surah / 6,236-ayah validation. See `THIRD_PARTY_NOTICES.md`.

Sacred-content rule: Quran text, translations/meals, tafsir and duas must never be machine/AI translated. Turkish meal, tafsir and translated dua content stay disabled until a human-authored source and its usage rights are explicitly approved.

## Run

```bash
npm install
npm run build:quran
npm run typecheck
npm test
npx expo start
```

RevenueCat runs in development mock mode until `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` are configured.

Prayer calculations use Adhan JS `CalculationMethod.Turkey()`, documented by its maintainers as an approximation of the Diyanet method. The app requests foreground location only and does not enable background location tracking.

Prayer reminders are local device notifications, opt-in only, and are refreshed as a rolling 10-day schedule when the prayer screen is opened. Android declares `SCHEDULE_EXACT_ALARM` so scheduled prayer reminders can target exact calculated times.

## Release preparation

- [Release automation](docs/RELEASE_AUTOMATION.md)
- [Android device QA](docs/release/ANDROID_DEVICE_QA.md)
- [Play Console and RevenueCat values](docs/release/PLAY_CONSOLE_VALUES.md)
- [Android release checklist](docs/release/ANDROID_RELEASE_CHECKLIST.md)
- [Google Play store listing](docs/release/PLAY_STORE_LISTING.md)
- [Google Play asset manifest](docs/release/PLAY_STORE_ASSET_MANIFEST.md)
- [Paywall release QA](docs/release/PAYWALL_QA.md)
- [Turkish privacy policy draft](docs/release/PRIVACY_POLICY_TR.md)
- [Turkish terms of use draft](docs/release/TERMS_OF_USE_TR.md)
