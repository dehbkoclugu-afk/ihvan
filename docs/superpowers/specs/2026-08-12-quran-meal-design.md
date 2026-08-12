# İhvan Quran Meal Design

## Goal

Add human-authored Turkish and English Quran meaning translations to İhvan without changing the bundled Arabic Tanzil text or coupling sacred-content language to the application UI language.

## Source decision

- Turkish: QuranEnc `turkish_rwwad`, Rowwad Translation Center, version `1.0.4` (2025-09-28).
- English: QuranEnc `english_rwwad`, Rowwad Translation Center, version `1.0.19` (2026-03-12).
- Both are human-authored translations of meanings. No AI or machine translation is used.
- The exact official SQLite packages, including their footnotes, are bundled for offline reading, attributed to QuranEnc, and protected by reviewed SHA-256 fingerprints.
- QuranEnc's redistribution conditions apply: do not modify translation content; name QuranEnc and the publisher; show the version; preserve source metadata; report corrections upstream; update bundled packages when QuranEnc publishes a newer version; do not place inappropriate advertising beside sacred content.

## Product behavior

- Meal is an independent persisted preference: `none`, `tr`, or `en`.
- Changing the application UI language never changes the selected meal.
- Default remains `none` for existing and new users.
- Profile exposes three clear choices: off, Turkish, English.
- Surah and juz readers show Arabic first and the selected translation below it.
- Arabic stays fixed RTL/right aligned. Turkish and English remain LTR and use the UI text metrics.
- Today remains Arabic-only in this iteration to keep its art composition and daily ritual unchanged.
- Reader and Data & Privacy screens show source, publisher, version, human-authored/no-machine-translation statement, and QuranEnc link.

## Data architecture

- Keep `src/data/quran.generated.ts` and its Tanzil Arabic data unchanged.
- Store the two reviewed source snapshots under `vendor/quranenc/`.
- A deterministic build script validates explicit `(surah, ayah)` coordinates against the existing 114-surah/6,236-ayah corpus and generates compact ordered string arrays.
- Runtime lookup uses the existing Quran global offset (`surah.start + ayah - 2`), so no extra map or dependency is required.
- Integrity tests enforce source versions, hashes, coordinate parity, non-empty text, no duplicates, and active human-authored provenance.

## Persistence and migration

- Extend the existing user store; do not create another Zustand store.
- Normalize unknown or missing meal values to `none`.
- Export only the user's meal preference, never duplicate the bundled sacred text inside personal-data exports.

## Out of scope

- Tafsir, transliteration, audio translation, download-on-demand packs, and multiple translations per language.
- Automatic runtime updates. Source refresh is a reviewed repository change, aided by a verification script.
- Any modification, simplification, correction, or machine translation of the source meal text.
