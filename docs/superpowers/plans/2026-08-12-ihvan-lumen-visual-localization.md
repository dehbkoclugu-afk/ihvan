# İhvan Lumen Visual System and Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an original İhvan visual system with theme-aware ArtSlot artwork, redesign the approved screens, and provide complete offline Turkish, English, and Arabic application localization with coherent Arabic RTL behavior.

**Architecture:** Localization is a screen-facing boundary built from one locale catalog, exact-key dictionaries, a persisted System/manual preference, and direction helpers. Artwork is a separate boundary built from stable asset IDs, a theme-aware registry, `useArtwork`, and `ArtSlot`; screens keep their current domain stores and services and consume only translations and artwork IDs. Existing Quran, prayer-time, qibla, notification, progress, purchase, export, and deletion behavior remains authoritative.

**Tech Stack:** Expo 53, React Native 0.79, Expo Router 5, TypeScript 5.8, Zustand 5, Expo Localization, Node test runner, Playwright screenshot tooling already present in the repository.

## Global Constraints

- Work on `agent/ihvan-lumen-visual-localization`, based on `claude-code`.
- Use an isolated worktree before implementation; do not modify an unrelated dirty checkout.
- Ship exactly `tr`, `en`, and `ar` as selectable application locales in this release.
- Keep application language independent from Quran Arabic text and any future meal/tafsir language.
- Never generate or machine-translate Quran text, meal, tafsir, dua, transliteration, or recitation content.
- Do not reuse Lumen's Christian artwork or devotional copy.
- Preserve all current domain stores, persisted progress, prayer calculations, qibla behavior, notification scheduling, RevenueCat behavior, export, and deletion.
- Do not add a downloadable language-pack system or a runtime dependency for the first three bundled locales.
- English is the runtime recovery dictionary; existing users migrate to `system`.
- Production must never show raw translation keys or diagnostic artwork IDs.
- Every implementation task ends with the smallest relevant runnable check and an intentional commit.

---

## File structure

### New localization files

- `src/i18n/applicationLocales.ts`: locale catalog and BCP-47 resolver.
- `src/i18n/applicationLocales.test.ts`: catalog and resolver tests.
- `src/i18n/direction.ts`: RTL, alignment, row, and icon helpers.
- `src/i18n/direction.test.ts`: direction behavior tests.
- `src/i18n/index.ts`: `useT`, `translate`, locale formatting boundary.
- `src/i18n/translations.ts`: dictionary contract and lookup table.
- `src/i18n/translations.test.ts`: exact-key/interpolation/value validation.
- `src/i18n/locales/tr.ts`: complete Turkish UI dictionary.
- `src/i18n/locales/en.ts`: complete English recovery dictionary.
- `src/i18n/locales/ar.ts`: complete Arabic UI dictionary.
- `app/application-language.tsx`: System/manual language picker.

### New artwork files

- `src/assets/registry.ts`: typed artwork IDs, metadata, and theme pairs.
- `src/assets/registry.test.ts`: registry completeness and fallback contract.
- `src/assets/art/*.webp`: approved optimized İhvan artwork.
- `src/hooks/useArtwork.ts`: theme-aware artwork resolver.
- `src/components/ArtSlot.tsx`: shared image, scrim, fallback, and overlay component.
- `src/components/ProgressRing.tsx`: accessible daily progress indicator.
- `src/components/StreakMark.tsx`: non-emoji streak indicator.

### Existing files changed together

- Store/root/navigation: `src/state/useUserStore.ts`, `src/lib/userProfile.ts`, `src/lib/userProfile.test.ts`, `app/_layout.tsx`, `app/(tabs)/_layout.tsx`.
- Shared UI: `src/components/Screen.tsx`, `SectionHeader.tsx`, `RitualCard.tsx`, `AyahCard.tsx`, `PrayerTimesCard.tsx`, `QiblaCard.tsx`, `QuranTextSizeControl.tsx`.
- Primary screens: `app/onboarding.tsx`, `app/(tabs)/today.tsx`, `quran.tsx`, `worship.tsx`, `journal.tsx`, `profile.tsx`, `app/paywall.tsx`.
- Secondary screens: `app/bookmarks.tsx`, `data-and-privacy.tsx`, `dhikr-history.tsx`, `juz/[id].tsx`, `prayer-history.tsx`, `quran-history.tsx`, `surah/[id].tsx`.
- User-facing service copy: `src/hooks/usePrayerLocation.ts`, `src/services/prayerNotifications.ts`, `src/services/prayerTimes.ts`, `src/services/userDataExport.ts`.
- Validation/config: `package.json`, `app.json`, `scripts/validate-ui-locales.mjs`, `scripts/verify-native-config.mjs`.

---

### Task 1: Locale catalog, resolver, and direction helpers

**Files:**
- Create: `src/i18n/applicationLocales.ts`
- Create: `src/i18n/applicationLocales.test.ts`
- Create: `src/i18n/direction.ts`
- Create: `src/i18n/direction.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `AppLocale = 'tr' | 'en' | 'ar'`
- Produces: `resolveApplicationLocale(languageTag?, languageCode?): AppLocale`
- Produces: `getApplicationDirection(locale): 'ltr' | 'rtl'`
- Produces: `getDirectionalIconName(icon, locale)`, `rowDirection(locale)`, and `textAlignment(locale)`

- [ ] **Step 1: Write resolver and direction tests**

```ts
// src/i18n/applicationLocales.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPLICATION_LOCALE_TAGS,
  resolveApplicationLocale,
} from './applicationLocales.ts';

test('ships exactly Turkish, English, and Arabic', () => {
  assert.deepEqual(APPLICATION_LOCALE_TAGS, ['tr', 'en', 'ar']);
});

test('resolves supported BCP-47 device locales', () => {
  assert.equal(resolveApplicationLocale('tr-TR', 'tr'), 'tr');
  assert.equal(resolveApplicationLocale('en-US', 'en'), 'en');
  assert.equal(resolveApplicationLocale('ar-SA', 'ar'), 'ar');
  assert.equal(resolveApplicationLocale('de-DE', 'de'), 'en');
  assert.equal(resolveApplicationLocale(null, null), 'en');
});
```

```ts
// src/i18n/direction.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getApplicationDirection,
  getDirectionalIconName,
  rowDirection,
  textAlignment,
} from './direction.ts';

test('Arabic is RTL and Turkish/English are LTR', () => {
  assert.equal(getApplicationDirection('ar'), 'rtl');
  assert.equal(getApplicationDirection('tr'), 'ltr');
  assert.equal(getApplicationDirection('en'), 'ltr');
  assert.equal(getApplicationDirection('retired'), 'ltr');
});

test('mirrors navigation icons but not playback controls', () => {
  assert.equal(getDirectionalIconName('chevron-back', 'ar'), 'chevron-forward');
  assert.equal(getDirectionalIconName('arrow-forward', 'ar'), 'arrow-back');
  assert.equal(getDirectionalIconName('play-skip-forward', 'ar'), 'play-skip-forward');
  assert.equal(rowDirection('ar'), 'row-reverse');
  assert.equal(textAlignment('ar'), 'right');
});
```

- [ ] **Step 2: Add the tests to the repository test command and verify red**

Update `package.json` so `npm test` includes both new test files.

Run: `npm test`  
Expected: FAIL because `applicationLocales.ts` and `direction.ts` do not exist.

- [ ] **Step 3: Implement the minimal locale catalog**

```ts
// src/i18n/applicationLocales.ts
export type AppDirection = 'ltr' | 'rtl';

export const APPLICATION_LOCALES = [
  { tag: 'tr', nativeName: 'Türkçe', direction: 'ltr' },
  { tag: 'en', nativeName: 'English', direction: 'ltr' },
  { tag: 'ar', nativeName: 'العربية', direction: 'rtl' },
] as const;

export const APPLICATION_LOCALE_TAGS = APPLICATION_LOCALES.map(({ tag }) => tag);
export type AppLocale = (typeof APPLICATION_LOCALES)[number]['tag'];

const supported = new Set<string>(APPLICATION_LOCALE_TAGS);

export function resolveApplicationLocale(
  languageTag?: string | null,
  languageCode?: string | null,
): AppLocale {
  const raw = (languageTag ?? '').replace(/_/g, '-').toLowerCase();
  const exact = APPLICATION_LOCALE_TAGS.find((tag) => tag === raw);
  if (exact) return exact;
  const code = (languageCode ?? raw.split('-')[0] ?? '').toLowerCase();
  return supported.has(code) ? code as AppLocale : 'en';
}
```

- [ ] **Step 4: Implement direction helpers**

```ts
// src/i18n/direction.ts
import { APPLICATION_LOCALES } from './applicationLocales.ts';

export type DirectionalIoniconName =
  | 'chevron-back'
  | 'chevron-forward'
  | 'arrow-back'
  | 'arrow-forward'
  | 'play-skip-back'
  | 'play-skip-forward';

const rtlIcons: Partial<Record<DirectionalIoniconName, DirectionalIoniconName>> = {
  'chevron-back': 'chevron-forward',
  'chevron-forward': 'chevron-back',
  'arrow-back': 'arrow-forward',
  'arrow-forward': 'arrow-back',
};

export function getApplicationDirection(locale: string): 'ltr' | 'rtl' {
  return APPLICATION_LOCALES.find((item) => item.tag === locale)?.direction ?? 'ltr';
}

export const isApplicationRTL = (locale: string) =>
  getApplicationDirection(locale) === 'rtl';

export const rowDirection = (locale: string) =>
  isApplicationRTL(locale) ? 'row-reverse' as const : 'row' as const;

export const textAlignment = (locale: string) =>
  isApplicationRTL(locale) ? 'right' as const : 'left' as const;

export function getDirectionalIconName(
  icon: DirectionalIoniconName,
  locale: string,
): DirectionalIoniconName {
  return isApplicationRTL(locale) ? rtlIcons[icon] ?? icon : icon;
}
```

- [ ] **Step 5: Run focused checks**

Run: `node --experimental-strip-types --test src/i18n/applicationLocales.test.ts src/i18n/direction.test.ts`  
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add package.json src/i18n/applicationLocales.ts src/i18n/applicationLocales.test.ts src/i18n/direction.ts src/i18n/direction.test.ts
git commit -m "add application locale and RTL foundation"
```

---

### Task 2: Translation contract and complete bundled dictionaries

**Files:**
- Create: `src/i18n/locales/en.ts`
- Create: `src/i18n/locales/tr.ts`
- Create: `src/i18n/locales/ar.ts`
- Create: `src/i18n/translations.ts`
- Create: `src/i18n/translations.test.ts`
- Create: `src/i18n/index.ts`
- Create: `scripts/validate-ui-locales.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `TranslationKey`
- Produces: `useT(): { locale: AppLocale; t(key, values?): string }`
- Produces: `translate(key, values?): string`
- Produces: `formatLocaleDate(date, options): string` and `formatLocaleNumber(value): string`

- [ ] **Step 1: Define the English source contract by namespace**

Create `src/i18n/locales/en.ts` with complete keys for:

```ts
const en = {
  'common.system': 'System',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.retry': 'Try again',
  'common.history': 'History',
  'common.loading': 'Loading…',
  'tab.today': 'Today',
  'tab.quran': 'Quran',
  'tab.worship': 'Worship',
  'tab.journal': 'Notes',
  'tab.profile': 'Me',
  'onboarding.brand': 'İHVAN',
  'onboarding.title': 'Bring the Quran a little closer every day.',
  'onboarding.body': 'An ayah, dua, dhikr, and a quiet moment of reflection. A calm five-minute daily ritual.',
  'onboarding.namePlaceholder': 'Your name (optional)',
  'onboarding.start': 'Start today',
  'onboarding.privacy': 'No account required · Your progress stays on this device',
  'today.greeting': 'Peace',
  'today.quranGoal': 'Quran goal',
  'today.prayers': 'Prayers',
  'today.rhythm': "Today's rhythm",
  'today.reflect': 'Reflect on the meaning',
  'today.reflectSub': 'A two-minute quiet pause',
  'today.dua': "Today's dua",
  'today.duaSub': 'A short intention and dua',
  'today.dhikr': '33 dhikr',
  'today.read': 'Read',
  'today.readDone': 'Read today',
  'quran.title': 'Quran',
  'quran.subtitle': '114 surahs · 6,236 ayahs · Arabic Uthmani text',
  'quran.continue': 'CONTINUE READING',
  'quran.dailyGoal': "Today's reading goal",
  'quran.surahs': 'Surahs',
  'quran.juzs': 'Juz',
  'quran.searchPlaceholder': 'Search by surah name or 2:255',
  'worship.title': 'Worship',
  'worship.todayPrayers': "Today's prayers",
  'worship.prayerTimes': 'Prayer times',
  'worship.qibla': 'QIBLA',
  'worship.dua': "Today's dua",
  'worship.dhikr': 'Dhikr',
  'journal.title': 'Notes',
  'journal.subtitle': 'A private place for reflection',
  'journal.empty': 'Nothing here yet. A quiet note can begin with one line.',
  'journal.placeholder': 'Write privately…',
  'profile.title': 'Me',
  'profile.profile': 'Profile',
  'profile.appearance': 'Appearance',
  'profile.language': 'Application language',
  'profile.quranSize': 'Quran text size',
  'profile.data': 'Data',
  'profile.export': 'Export my data',
  'profile.dataSources': 'Data and sources',
  'profile.plus': 'İhvan Plus',
  'language.title': 'Application language',
  'language.auto': 'Use device language',
  'paywall.brand': 'İHVAN PLUS',
  'paywall.title': 'Deepen your ritual.',
  'paywall.body': "Support İhvan's sustainable development. Plans and prices are loaded from the store.",
  'paywall.restore': 'Restore purchases',
  'paywall.manage': 'Manage subscription',
  'paywall.privacy': 'Privacy and data',
  'a11y.back': 'Back',
  'a11y.refreshPrayerTimes': 'Refresh prayer times',
  'a11y.liveQibla': 'Live qibla compass',
  'error.genericTitle': 'Something went wrong.',
  'error.genericBody': 'Your data is safe on this device. Reload the screen and continue.',
  'error.tryAgain': 'Try again',
} as const;

export default en;
```

Extend this same object during Tasks 3 and 4 with every user-facing string encountered in the exact files listed there. Do not leave a literal behind merely because it is an alert, accessibility label, loading state, notification body, or error.

- [ ] **Step 2: Add exact Turkish and Arabic dictionaries**

Create `tr.ts` and `ar.ts` with the identical keys. Preserve İhvan, Quran identities, numbers, interpolation markers, and product terminology. Arabic UI copy must be reviewed as application copy only; do not insert translated Quran, dua, meal, or tafsir content.

Use these exact base values:

```ts
// selected critical examples from tr.ts
'common.system': 'Sistem',
'tab.today': 'Bugün',
'tab.quran': 'Kur’an',
'tab.worship': 'İbadet',
'tab.journal': 'Notlar',
'tab.profile': 'Ben',
'profile.language': 'Uygulama dili',
'language.auto': 'Cihaz dilini kullan',
'error.tryAgain': 'Tekrar dene',
```

```ts
// selected critical examples from ar.ts
'common.system': 'النظام',
'tab.today': 'اليوم',
'tab.quran': 'القرآن',
'tab.worship': 'العبادة',
'tab.journal': 'ملاحظات',
'tab.profile': 'أنا',
'profile.language': 'لغة التطبيق',
'language.auto': 'استخدام لغة الجهاز',
'error.tryAgain': 'حاول مرة أخرى',
```

- [ ] **Step 3: Write dictionary-validation tests**

```ts
// src/i18n/translations.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import en from './locales/en.ts';
import tr from './locales/tr.ts';
import ar from './locales/ar.ts';

const dictionaries = { en, tr, ar };
const sourceKeys = Object.keys(en).sort();
const tokens = (value: string) =>
  [...value.matchAll(/\{\{[^}]+\}\}|\$\{[^}]+\}/g)].map((match) => match[0]).sort();

for (const [locale, dictionary] of Object.entries(dictionaries)) {
  test(`${locale} has exact key parity and valid values`, () => {
    assert.deepEqual(Object.keys(dictionary).sort(), sourceKeys);
    for (const key of sourceKeys) {
      const value = dictionary[key as keyof typeof dictionary];
      assert.equal(typeof value, 'string');
      assert.ok(value.trim(), `${locale}.${key}`);
      assert.doesNotMatch(value, /TODO|TRANSLATE_ME|MISSING_TRANSLATION/i);
      assert.deepEqual(tokens(value), tokens(en[key as keyof typeof en]));
    }
  });
}
```

- [ ] **Step 4: Implement translation lookup and formatting**

Use `getLocales()[0]` from `expo-localization`, the persisted language preference from Task 3, English key fallback, `Intl.DateTimeFormat(locale)`, and `Intl.NumberFormat(locale)`. Interpolate only named `{{token}}` values and leave store-provided prices untouched.

- [ ] **Step 5: Add the production validator**

`scripts/validate-ui-locales.mjs` imports all three dictionaries, compares exact keys and interpolation tokens, rejects empty strings and sentinels, and exits non-zero on the first violation.

Add scripts:

```json
{
  "ui-locales:verify": "node --experimental-strip-types scripts/validate-ui-locales.mjs",
  "ui-locales:verify:production": "node --experimental-strip-types scripts/validate-ui-locales.mjs --production"
}
```

- [ ] **Step 6: Run focused checks**

Run: `npm run ui-locales:verify:production && node --experimental-strip-types --test src/i18n/translations.test.ts`  
Expected: PASS with three complete dictionaries.

- [ ] **Step 7: Commit**

```bash
git add package.json scripts/validate-ui-locales.mjs src/i18n
git commit -m "add bundled Turkish English and Arabic UI dictionaries"
```

---

### Task 3: Persist language preference and apply root RTL

**Files:**
- Modify: `src/state/useUserStore.ts`
- Modify: `src/lib/userProfile.ts`
- Modify: `src/lib/userProfile.test.ts`
- Modify: `app/_layout.tsx`
- Modify: `app/(tabs)/_layout.tsx`
- Create: `app/application-language.tsx`

**Interfaces:**
- Consumes: `AppLocale`, `useT`, and direction helpers.
- Produces: `language: AppLocale | 'system'` and `setLanguage()` in `useUserStore`.

- [ ] **Step 1: Add a failing preference migration test**

Extend `src/lib/userProfile.test.ts`:

```ts
test('normalizes missing and invalid application language to system', () => {
  assert.equal(normalizeUserPreferences({}).language, 'system');
  assert.equal(normalizeUserPreferences({ language: 'de' }).language, 'system');
  assert.equal(normalizeUserPreferences({ language: 'ar' }).language, 'ar');
});
```

- [ ] **Step 2: Implement the preference**

Add to `UserState`:

```ts
language: AppLocale | 'system';
setLanguage: (value: AppLocale | 'system') => void;
```

Initialize `language: 'system'`, add `setLanguage`, and include the normalized value in `normalizeUserPreferences`. Do not change the storage key `ihvan-user`.

- [ ] **Step 3: Apply direction once at the root**

In `app/_layout.tsx`, resolve the active locale after hydration, derive direction with `getApplicationDirection`, and apply it to both `GestureHandlerRootView` and stack `contentStyle`. Replace the Turkish ErrorBoundary literals with translation keys through `translate()`.

- [ ] **Step 4: Localize tabs**

Replace tab titles with `useT()` values. Use the same five routes and icons; do not change navigation structure or tab height.

- [ ] **Step 5: Build the language picker**

The picker includes System, Türkçe, English, and العربية. Each row:

- has a 60-point minimum height;
- exposes selected state;
- displays the language in its native direction;
- persists only after the bundled dictionary is ready;
- uses the directional back icon helper.

- [ ] **Step 6: Run checks**

Run: `npm test && npm run typecheck && npm run ui-locales:verify:production`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/_layout.tsx app/'(tabs)'/_layout.tsx app/application-language.tsx src/state/useUserStore.ts src/lib/userProfile.ts src/lib/userProfile.test.ts
git commit -m "persist application language and apply Arabic RTL"
```

---

### Task 4: Move all UI and service copy behind the translation boundary

**Files:**
- Modify: all primary and secondary screen files listed in File structure.
- Modify: all shared component and user-facing service files listed in File structure.
- Modify: `src/i18n/locales/en.ts`, `tr.ts`, and `ar.ts`.

**Interfaces:**
- Consumes: `useT`, `translate`, `formatLocaleDate`, `formatLocaleNumber`, and direction helpers.
- Preserves: all domain-store method calls, notification sequencing, location permissions, purchase results, navigation routes, and Quran data.

- [ ] **Step 1: Localize shared components first**

Update `AyahCard`, `PrayerTimesCard`, `QiblaCard`, `QuranTextSizeControl`, and `RitualCard`. Pass translation keys or already translated strings only where ownership is clear. Keep Quran Arabic text, Tanzil attribution, prayer calculations, and numeric values unchanged.

- [ ] **Step 2: Localize onboarding, Today, and tabs**

Use `formatLocaleDate` instead of hardcoded `tr-TR`. Replace every visible, accessibility, empty, pressed, and completion label with dictionary keys. Keep the current one-step onboarding behavior.

- [ ] **Step 3: Localize Quran surfaces**

Update Quran, surah, juz, bookmarks, and Quran-history files. Translate screen chrome and status labels only. Do not translate:

- `ayah.text`;
- numeric `surah:ayah` identity;
- Tanzil source attribution name;
- source integrity data.

- [ ] **Step 4: Localize Worship without changing notification races**

Update Worship, PrayerTimesCard, QiblaCard, prayer history, dhikr history, `usePrayerLocation`, `prayerNotifications`, and `prayerTimes`. Keep `notificationOperation`, debouncing, cancellation, exact-alarm behavior, Adhan Turkey calculations, and stored prayer keys unchanged.

Notification title/body must use `translate()` at scheduling time rather than capturing a stale language during module import.

- [ ] **Step 5: Localize Journal, Profile, privacy, export, and paywall**

Translate local-only reassurance, data export, data deletion, RevenueCat state, recovery, legal, pending, and subscription-management copy. Keep store prices intact and format only app-owned dates/numbers.

Add the Profile language row that routes to `/application-language`.

- [ ] **Step 6: Enforce no user-facing Turkish literals outside dictionaries**

Run:

```bash
rg -n --glob '*.ts' --glob '*.tsx'   "Bugün|Kur’an|İbadet|Namaz|Kıble|Tekrar dene|Gizlilik|Satın al|Bildirim|Veriler"   app src   | rg -v "src/i18n/locales|src/data/quran|src/data/duas|test"
```

Expected: no UI literals. Domain constants and licensed/static source names are reviewed individually rather than mechanically translated.

- [ ] **Step 7: Run regression checks**

Run: `npm test && npm run typecheck && npm run lint && npm run ui-locales:verify:production`  
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app src/components src/hooks src/services src/i18n/locales
git commit -m "localize İhvan interface and service copy"
```

---

### Task 5: Add the typed artwork registry and ArtSlot

**Files:**
- Create: `src/assets/registry.ts`
- Create: `src/assets/registry.test.ts`
- Create: `src/hooks/useArtwork.ts`
- Create: `src/components/ArtSlot.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: `AssetId`, `ArtworkPair`, `artSpecs`, `themedArtRegistry`.
- Produces: `useArtwork().source(id)`, `scheme`, and safe foreground colors.
- Produces: `ArtSlot({ id, height, fit, radius, variant, style, children })`.

- [ ] **Step 1: Write registry contract tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { ART_IDS, artSpecs, getArtworkPair } from './registry.ts';

test('every approved artwork ID has metadata', () => {
  assert.equal(ART_IDS.length, 12);
  for (const id of ART_IDS) {
    assert.ok(artSpecs[id].label);
    assert.match(artSpecs[id].size, /^\d+x\d+$/);
  }
});

test('unknown or unfinished artwork resolves safely', () => {
  assert.equal(getArtworkPair('I99-missing' as never), null);
});
```

- [ ] **Step 2: Define the stable IDs**

```ts
export const ART_IDS = [
  'I1-brand-mark',
  'I2-welcome-hero',
  'I3-daily-ayah',
  'I4-continue-quran',
  'I5-prayer-times',
  'I6-qibla',
  'I7-dhikr',
  'I8-dua',
  'I9-night-reflection',
  'I10-journal-empty',
  'I11-journal-compose',
  'I12-paywall-hero',
] as const;

export type AssetId = (typeof ART_IDS)[number];
```

Initially register unavailable sources as `null`; Task 6 replaces them with static `require()` pairs.

- [ ] **Step 3: Implement `useArtwork`**

Resolve `useThemeName()` to `dawn` or `vigil`, select a pair source, and expose foreground colors that remain readable over the registered art.

- [ ] **Step 4: Implement `ArtSlot`**

Match the approved `bare|row|card|hero` API. Render:

- the selected image with `accessibilityIgnoresInvertColors`;
- a semantic flat scrim when the variant requires one;
- children over the art;
- a labeled development placeholder;
- a neutral, unlabeled production geometric fallback.

Do not add a new gradient or image dependency.

- [ ] **Step 5: Run checks**

Run: `node --experimental-strip-types --test src/assets/registry.test.ts && npm run typecheck`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json src/assets src/hooks/useArtwork.ts src/components/ArtSlot.tsx
git commit -m "add theme-aware İhvan ArtSlot system"
```

---

### Task 6: Produce and optimize original İhvan artwork

**Files:**
- Create: `src/assets/art/I2-welcome-hero-{dawn,vigil}.webp`
- Create: `src/assets/art/I3-daily-ayah-{dawn,vigil}.webp`
- Create: `src/assets/art/I4-continue-quran-{dawn,vigil}.webp`
- Create: `src/assets/art/I5-prayer-times.webp`
- Create: `src/assets/art/I6-qibla.webp`
- Create: `src/assets/art/I7-dhikr.webp`
- Create: `src/assets/art/I8-dua.webp`
- Create: `src/assets/art/I9-night-reflection.webp`
- Create: `src/assets/art/I10-journal-empty.webp`
- Create: `src/assets/art/I11-journal-compose.webp`
- Create: `src/assets/art/I12-paywall-hero-{dawn,vigil}.webp`
- Modify: `src/assets/registry.ts`

**Interfaces:**
- Consumes: approved Asset IDs from Task 5.
- Produces: local static image pairs resolvable by Metro.

- [ ] **Step 1: Generate source artwork with the imagegen skill**

Use one consistent art-direction prompt: quiet Islamic editorial illustration, architectural light, mihrab-inspired geometry, emerald/navy/parchment palette, subtle paper grain, no people, no readable text, no Arabic glyphs, no Quran quotation, no Christian symbols, no logos.

Generate slot-specific compositions:

- Welcome: vertical mihrab light with safe lower/upper text zones.
- Daily ayah: abstract dawn horizon and geometric frame; central text-safe area.
- Continue Quran: rahle silhouette without legible page text.
- Prayer times: five-light rhythm with no clock digits.
- Qibla: horizon and directional geometry without map labels.
- Dhikr: tactile beads/geometry without sacred inscriptions.
- Dua: raised-light composition without hands or figures.
- Night reflection: lantern and dark horizon.
- Journal: paper/ink atmosphere without handwriting.
- Paywall: premium architectural light, restrained gold, large text-safe lower region.

- [ ] **Step 2: Inspect every generated image before use**

Reject any image containing accidental Arabic-like writing, malformed religious objects, people, Christian iconography, visible watermarks, or insufficient text contrast zones.

- [ ] **Step 3: Crop and optimize**

Create 2× assets sized for their slots, convert to WebP, strip metadata, and keep each file below 500 KB unless visible banding requires a documented exception.

- [ ] **Step 4: Register static sources**

Use literal `require('./art/file.webp')` calls; Metro cannot resolve computed require paths.

- [ ] **Step 5: Verify registry and bundle resolution**

Run: `npm run typecheck && node --experimental-strip-types --test src/assets/registry.test.ts`  
Expected: PASS and all 12 IDs resolve to a source in both themes.

- [ ] **Step 6: Commit**

```bash
git add src/assets/art src/assets/registry.ts
git commit -m "add original İhvan visual artwork"
```

---

### Task 7: Add progress primitives and redesign Onboarding and Today

**Files:**
- Create: `src/components/ProgressRing.tsx`
- Create: `src/components/StreakMark.tsx`
- Modify: `src/components/RitualCard.tsx`
- Modify: `src/components/AyahCard.tsx`
- Modify: `app/onboarding.tsx`
- Modify: `app/(tabs)/today.tsx`

**Interfaces:**
- Consumes: `ArtSlot`, `useArtwork`, `useT`, and current streak/Quran/prayer/dhikr stores.
- Produces: accessible visual progress without changing store semantics.

- [ ] **Step 1: Add small pure progress tests**

Extract and test `clampProgress(done, total)` so zero/overflow states render safely. Reuse current day-count functions rather than duplicating streak logic.

- [ ] **Step 2: Implement ProgressRing and StreakMark**

Use React Native views and Ionicons only. Expose progress/summary accessibility values. Respect reduced motion by adding no required ambient animation in this release.

- [ ] **Step 3: Redesign onboarding**

Add `I2-welcome-hero`, keep optional name and one-step completion, retain normalization and route replacement, add localized on-device privacy reassurance, and maintain keyboard-safe access to the primary action.

- [ ] **Step 4: Redesign Today**

- locale-aware date and greeting;
- StreakMark replacing the emoji;
- artwork-backed daily ayah;
- existing Quran/prayer progress cards;
- ProgressRing for the four-step rhythm;
- artwork-backed ritual/evening cards;
- unchanged completion, history, and routing calls.

- [ ] **Step 5: Run checks**

Run: `npm test && npm run typecheck && npm run lint`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/onboarding.tsx app/'(tabs)'/today.tsx src/components/AyahCard.tsx src/components/RitualCard.tsx src/components/ProgressRing.tsx src/components/StreakMark.tsx
git commit -m "redesign onboarding and daily ritual"
```

---

### Task 8: Redesign Quran, Worship, Journal, Profile, and paywall

**Files:**
- Modify: `app/(tabs)/quran.tsx`
- Modify: `app/(tabs)/worship.tsx`
- Modify: `app/(tabs)/journal.tsx`
- Modify: `app/(tabs)/profile.tsx`
- Modify: `app/paywall.tsx`
- Modify: `src/components/PrayerTimesCard.tsx`
- Modify: `src/components/QiblaCard.tsx`
- Modify: `src/components/Screen.tsx`
- Modify: `src/components/SectionHeader.tsx`

**Interfaces:**
- Consumes: approved artwork IDs and translation boundary.
- Preserves: every current domain action and service call.

- [ ] **Step 1: Redesign Quran**

Wrap continue-reading in `I4-continue-quran`; preserve search, direct ayah, filters, surah/juz lists, goals, coverage, bookmarks, and history. Artwork is not used inside the reading route.

- [ ] **Step 2: Redesign Worship**

Use `I5-prayer-times`, `I6-qibla`, `I7-dhikr`, and `I8-dua` only as entry/section framing. Keep live values on opaque surfaces. Preserve the existing notification race controls and location permission branches byte-for-byte except for translated copy/layout wrappers.

- [ ] **Step 3: Redesign Journal**

Use `I10-journal-empty` only when empty and `I11-journal-compose` as restrained spot art. Preserve local CRUD and private-state behavior.

- [ ] **Step 4: Refresh Profile**

Add the language row, localize number formatting, keep theme/text size/export/privacy/Plus controls, and use directional chevrons.

- [ ] **Step 5: Redesign paywall**

Use `I12-paywall-hero`; preserve catalog loading, plan IDs, store prices, purchase/restore/pending/cancelled states, management link, and legal copy. Do not add unavailable benefits.

- [ ] **Step 6: Run complete checks**

Run: `npm test && npm run typecheck && npm run lint && npm run ui-locales:verify:production`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app src/components/PrayerTimesCard.tsx src/components/QiblaCard.tsx src/components/Screen.tsx src/components/SectionHeader.tsx
git commit -m "apply İhvan visual system across core screens"
```

---

### Task 9: Visual QA, Android release gate, and regression evidence

**Files:**
- Create: `docs/qa/IHVAN_VISUAL_LOCALIZATION_QA.md`
- Modify: `scripts/verify-native-config.mjs` only if the locale/native config check exposes a real gap.
- Modify: `app.json` only for verified supported-locale metadata required by the current Expo build.

**Interfaces:**
- Produces: repeatable validation evidence and release blockers.
- Does not change product behavior unless a failing check identifies a defect.

- [ ] **Step 1: Run the automated gate**

```bash
npm ci
npm run build:quran
npm run typecheck
npm run lint
npm test
npm run ui-locales:verify:production
node scripts/verify-native-config.mjs
```

Expected: every command exits 0.

- [ ] **Step 2: Run an Android production export**

Run the repository's existing Android export/build command from release documentation. Expected: Metro resolves every static artwork source and the export completes without missing-module, missing-font, or locale errors.

- [ ] **Step 3: Capture the visual matrix**

Capture Onboarding, Today, Quran, Worship, Journal, Profile, language picker, and paywall for:

- Turkish Dawn and Vigil;
- English Dawn and Vigil;
- Arabic Dawn and Vigil.

Record exact device viewport, build SHA, locale, and theme in `IHVAN_VISUAL_LOCALIZATION_QA.md`.

- [ ] **Step 4: Verify the visual checklist**

For each capture, record PASS/FAIL for:

- safe-area and bottom-tab spacing;
- readable art crop and scrim;
- no generated writing in artwork;
- no truncation or clipped Dynamic Type;
- Arabic row order, text alignment, and directional icons;
- 44×44 minimum actions;
- keyboard access on onboarding/journal/profile;
- no raw key or diagnostic asset ID.

- [ ] **Step 5: Run focused domain regression**

Verify:

- Quran integrity remains 114 surahs and 6,236 ayahs;
- last-read, bookmarks, goal, history, and text size persist through language changes;
- prayer times and qibla still calculate from location;
- live compass starts/stops;
- per-prayer notifications enable, reschedule, disable, and recover from denied permission;
- five-prayer and dhikr history persist;
- journal CRUD and export work;
- purchases load, buy/restore errors remain recoverable;
- data export and deletion still work;
- switching app language does not mutate Quran content or progress.

- [ ] **Step 6: Fix only evidence-backed defects and rerun the smallest failing gate**

Keep fixes in the owning shared boundary where possible. Do not introduce unrelated feature work from the second feature package.

- [ ] **Step 7: Commit QA evidence**

```bash
git add docs/qa/IHVAN_VISUAL_LOCALIZATION_QA.md app.json scripts/verify-native-config.mjs
git commit -m "verify İhvan visual localization release"
```

---

## Final verification

- [ ] `git status -sb` shows only intended branch changes and a clean worktree after commits.
- [ ] `git diff claude-code...HEAD --check` reports no whitespace errors.
- [ ] All automated commands in Task 9 pass.
- [ ] The visual matrix has no unresolved FAIL.
- [ ] No sacred-content file changed except UI-only source attribution labels.
- [ ] No existing persisted-store key was renamed or reset.
- [ ] The branch is ready for review before any second-package feature work begins.

## Deferred second feature package

After this plan is complete and reviewed, create a separate design/spec cycle for the audit findings: personalized onboarding, ayah action sheet/highlighting, curated Quran plans, verified guided dua playback, and contextual premium entry points. Do not fold these into this branch.
