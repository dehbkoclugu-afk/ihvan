# İhvan

İhvan is a Turkish-first Quran habit companion built on the proven Expo/React Native core of Lumen, while keeping the product, repository, content and identity completely separate.

## MVP loop

- Daily ayah ritual and streak
- Quran starter reader with Arabic-first presentation
- Dua and dhikr practice
- Private reflection journal
- Vigil/Dawn themes
- RevenueCat-ready subscription boundary

The bundled Quran content is intentionally limited to a small verified starter set. Full Quran text, translations, tafsir and recitation should be synced from a vetted source such as Quran Foundation before store release; generated or machine-translated scripture must never be used.

## Run

```bash
npm install
npm run typecheck
npm test
npx expo start
```

RevenueCat runs in development mock mode until `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` are configured.
