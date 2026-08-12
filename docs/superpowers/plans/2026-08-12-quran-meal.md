# Quran Meal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bundle selectable human-authored Turkish and English Quran meaning translations for offline reading with explicit licensing and integrity controls.

**Architecture:** Keep Arabic Quran data immutable and generate two separate ordered meal arrays from reviewed QuranEnc snapshots. Persist the meal preference in the existing user store and render it only beneath Arabic ayahs in surah and juz readers.

**Tech Stack:** Expo 53, React Native 0.79, TypeScript 5.8, Zustand, Node built-in test runner.

## Global Constraints

- Never machine-translate Quran or meal content.
- Never modify, simplify, add to, or delete from QuranEnc translation content.
- UI language and meal language remain independent.
- Arabic Tanzil data and Quran progress keys remain unchanged.
- Bundled QuranEnc versions are `turkish_rwwad@1.0.4` and `english_rwwad@1.0.19`.
- Every source refresh requires version, SHA-256, 114-surah, and 6,236-coordinate verification.

---

### Task 1: Source snapshots and deterministic generator

**Files:**
- Create: `vendor/quranenc/turkish_rwwad-v1.0.4.json`
- Create: `vendor/quranenc/english_rwwad-v1.0.19.json`
- Create: `scripts/build-quran-meals.mjs`
- Create: `src/data/quranMeals.generated.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: official QuranEnc SQLite packages with coordinate-bearing translation and footnote records.
- Produces: `QURAN_MEAL_TR`, `QURAN_MEAL_EN`, and immutable metadata constants.

- [ ] Copy the two reviewed source snapshots without editing their contents.
- [ ] Add a generator that rejects unknown versions, bad hashes, missing/duplicate coordinates, blank translations, and divergence from the existing Quran corpus.
- [ ] Generate compact ordered TypeScript arrays.
- [ ] Add `build:quran-meals` to package scripts and include the integrity test in `npm test`.
- [ ] Run the generator twice and assert no Git diff on the second run.

### Task 2: Runtime model, policy, and integrity tests

**Files:**
- Create: `src/data/quranMeals.ts`
- Create: `src/data/quranMeals.integrity.test.ts`
- Modify: `src/data/contentPolicy.ts`
- Modify: `src/lib/quranDisplay.ts`

**Interfaces:**
- Produces: `QuranMealPreference`, `normalizeQuranMealPreference(value)`, `getQuranMealAyah(surah, ayah, preference)`, `getQuranMealSource(preference)`.

- [ ] Write failing tests for preference normalization, valid/invalid lookup, counts, versions, source hashes, and active human-authored provenance.
- [ ] Add the three-value meal preference type and normalizer.
- [ ] Add O(1) lookup over generated arrays using Quran surah offsets.
- [ ] Activate the two explicit translation sources with language, publisher, version, URL, and redistribution terms.
- [ ] Run the focused tests.

### Task 3: Persisted preference and personal-data export

**Files:**
- Modify: `src/lib/userProfile.ts`
- Modify: `src/lib/userProfile.test.ts`
- Modify: `src/state/useUserStore.ts`
- Modify: `src/lib/userData.ts`
- Modify: `src/lib/userData.test.ts`

**Interfaces:**
- Consumes: `QuranMealPreference` and its normalizer.
- Produces: `quranMeal`, `setQuranMeal(value)`, and preference-only export data.

- [ ] Add migration tests showing missing/invalid values become `none` and valid `tr`/`en` survive.
- [ ] Extend the user store with `quranMeal: 'none'` and `setQuranMeal`.
- [ ] Include only the selected preference in user-data export.
- [ ] Run profile and export tests.

### Task 4: Profile selector and reader rendering

**Files:**
- Modify: `app/(tabs)/profile.tsx`
- Modify: `app/surah/[id].tsx`
- Modify: `app/juz/[id].tsx`

**Interfaces:**
- Consumes: persisted meal preference and runtime meal lookup.

- [ ] Add an accessible three-option radiogroup in Profile.
- [ ] Render selected LTR meal text after each unchanged RTL Arabic ayah in both readers.
- [ ] Show source/version attribution when a meal is enabled.
- [ ] Verify application-language changes do not mutate the meal preference.

### Task 5: Localized policy and attribution copy

**Files:**
- Modify: `src/i18n/locales/tr.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/ar.ts`
- Modify: `app/data-and-privacy.tsx`
- Modify: `THIRD_PARTY_NOTICES.md`
- Modify: `README.md`

**Interfaces:**
- Produces equal tr/en/ar key coverage with identical interpolation tokens.

- [ ] Add selector, reader, source, version, and human-authored/no-machine-translation copy in all three UI locales.
- [ ] Update Data & Privacy and third-party notices with the two QuranEnc packages and terms.
- [ ] Update README sacred-content status.
- [ ] Run locale validation and translation tests.

### Task 6: Repository verification

**Files:**
- Test: all files above.

- [ ] Run `npm run build:quran-meals` twice and verify determinism.
- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run validate:locales`.
- [ ] Run `git diff --check` and inspect the sacred-content diff for accidental Arabic or meal edits.
- [ ] Commit the verified implementation and update the existing draft PR branch.
