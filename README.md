# İhvan

İhvan is a Turkish-first Quran habit companion built on the proven Expo/React Native core of Lumen, while keeping the product, repository, content and identity completely separate.

## MVP loop

- Daily ayah ritual and streak
- Quran starter reader with Arabic-first presentation
- Dua and dhikr practice
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
