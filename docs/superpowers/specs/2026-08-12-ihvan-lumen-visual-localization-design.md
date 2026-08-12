# İhvan Lumen Visual System and Localization Design

Date: 2026-08-12  
Status: Approved

## Goal

Bring İhvan's visual design, UI/UX polish, artwork system, and application localization to the quality level proven in Lumen, while preserving İhvan's independent Islamic identity and its stronger Quran, prayer-time, qibla, dhikr, notification, progress, and personal-data features.

The first localized release ships Turkish, English, and Arabic. The architecture must allow later locale expansion without changing screen APIs or coupling the application language to Quran or translation content.

## Product principles

- Adapt Lumen's reusable layout and delivery patterns, not its Christian artwork or devotional content.
- Keep İhvan calm, reverent, legible, and useful; avoid dashboard density and decorative noise.
- Preserve all existing user data and feature behavior.
- Treat Quran text, translations, tafsir, duas, transliteration, and recitation as sacred or licensed content. Never generate or machine-translate them for release.
- Keep application language, Quran Arabic text, and future meal/tafsir language as independent preferences.
- Build accessibility into components rather than repairing individual screens later.
- Use the existing Expo/React Native dependencies and design tokens unless a verified requirement cannot be met without a new dependency.

## Scope

### Included

- A typed, theme-aware artwork registry and reusable `ArtSlot` component.
- Original İhvan artwork for the approved screen slots, with Dawn and Vigil treatment where needed.
- Visual and interaction redesign of onboarding, Today, Quran, Worship, Journal, and paywall.
- A restrained Profile refresh needed to expose language selection and maintain consistency.
- Turkish, English, and Arabic UI dictionaries.
- BCP-47 device-locale resolution, a persisted System/manual language preference, and a language picker.
- Complete Arabic RTL behavior for layout, text alignment, navigation icons, and directional interaction.
- Locale-aware date and number formatting.
- Translation completeness, direction, regression, visual-smoke, and Android production-export checks.

### Excluded

- Lumen's Christian images, prayers, Scripture, plans, brand language, or visual symbols.
- Machine-generated Quran translations, tafsir, duas, transliterations, or Arabic quotations.
- Downloadable application-content packs in the first three-language release.
- Personalized onboarding quiz, ayah action sheet/highlighting, curated Quran plans, guided dua player, and contextual paywall behavior. These remain a second feature package after this design and localization release.
- Replacing İhvan's current prayer-time, qibla, Quran progress, prayer tracking, notification, or personal-data implementations.

## Visual language: Quiet Mihrab

İhvan uses the existing Dawn and Vigil foundations with a distinct Islamic editorial language.

### Palette

- Vigil remains deep navy with emerald light and warm ivory text.
- Dawn remains warm parchment with clear white surfaces and restrained green accents.
- Gold is reserved for earned completion, premium state, and small ceremonial details. It does not replace İhvan's emerald brand accent.
- No pure black or pure white is introduced where the existing semantic tokens already provide softer alternatives.
- Body text and interactive controls must retain WCAG AA contrast.

### Typography

- Fraunces remains the editorial display face for Latin-script headings.
- Figtree remains the interface face.
- Arabic uses the device's proven Arabic fallback rather than forcing a Latin-oriented font.
- Quran Arabic rendering remains governed by the existing Quran reader and its text-size controls; the visual redesign must not change Quran content or integrity.
- Long English and Arabic labels wrap instead of shrinking below accessible sizes.

### Shape and hierarchy

- Reuse the existing spacing, radius, and semantic color tokens.
- Hero artwork uses the existing large-card radius.
- Standard cards retain one-pixel borders and calm depth.
- Pills are reserved for filters, compact choices, and primary actions.
- Screen hierarchy is editorial: one clear masthead, one primary task, then supporting actions.
- The current emoji streak marker is replaced by an accessible icon/progress treatment.

### Art direction

Original artwork uses architectural light, mihrab-inspired geometry, rahle silhouettes, lantern light, paper texture, and quiet natural landscapes. It must avoid:

- readable Quran or Arabic text baked into generated images;
- depictions presented as historic prophets, companions, or other sacred figures;
- Christian symbols or repurposed Lumen compositions;
- generic neon gradients, stock-dashboard illustration, or excessive ornamental density.

## Artwork system

### Files and responsibilities

- `src/assets/registry.ts`: typed asset IDs, source registration, Dawn/Vigil pairs, and semantic artwork metadata.
- `src/assets/art/**`: optimized local WebP assets.
- `src/hooks/useArtwork.ts`: resolves the active theme, selected source, and artwork-safe foreground colors.
- `src/components/ArtSlot.tsx`: renders registered art, accessibility behavior, theme-aware scrims, radius, fit, and a safe fallback.
- Screen components request artwork only by stable asset ID; they never import artwork files directly.

### ArtSlot contract

`ArtSlot` accepts a stable ID, optional height, fit, radius, semantic variant, style, and children overlay. Supported variants are `bare`, `row`, `card`, and `hero`.

A missing asset must never crash the application. Development shows a labeled diagnostic placeholder. Production shows a neutral branded geometric fallback without an internal ID or broken-image affordance.

Artwork remains decorative unless it conveys information that is unavailable in adjacent text. Decorative images are hidden from assistive technology.

### Initial asset inventory

- `I1-brand-mark`: compact brand treatment where a bitmap mark is needed.
- `I2-welcome-hero`: onboarding mihrab-light hero.
- `I3-daily-ayah`: Today ayah atmosphere.
- `I4-continue-quran`: Quran continue-reading hero.
- `I5-prayer-times`: prayer-time context art.
- `I6-qibla`: direction and horizon art.
- `I7-dhikr`: tactile, quiet repetition art.
- `I8-dua`: dua library/ritual art.
- `I9-night-reflection`: evening ritual art.
- `I10-journal-empty`: private reflection empty state.
- `I11-journal-compose`: writing prompt spot art.
- `I12-paywall-hero`: premium value art without sacred-text decoration.

Theme pairs are created when lighting materially changes readability or meaning. A single source may serve both themes when the slot scrim and surrounding surface provide sufficient contrast.

## Screen design

### Onboarding

- Add a finished hero slot and clearer brand masthead.
- Keep optional name entry and the single-step start flow in this release.
- Present the privacy reassurance beside the primary action.
- Do not request notification or location permissions before the user reaches the feature that needs them.

### Today

- Use a locale-aware editorial date and greeting.
- Replace the emoji streak tile with an accessible streak/progress component.
- Make the daily ayah the visual hero without altering its Arabic content.
- Preserve Quran goal, five-prayer progress, dhikr target, and the current daily ritual state.
- Apply artwork selectively to ritual and evening cards so progress remains scannable.

### Quran

- Turn continue-reading into the primary artwork-backed action.
- Preserve surah/juz navigation, search, direct ayah navigation, bookmarks, goals, coverage, history, and text-size behavior.
- Keep Arabic text as the dominant content; decorative art never competes with the reader.
- Localize interface labels and metadata while keeping Quran identities and Arabic text unchanged.

### Worship

- Group prayer times, qibla, prayer tracking, dua, and dhikr into clearer task sections.
- Use art for orientation and entry cards, not behind live compass readings or dense time data.
- Preserve location, Adhan Turkey calculation, live compass, exact-alarm notifications, per-prayer settings, and tracking history.

### Journal

- Add an artwork-backed empty state and compact compose prompt.
- Preserve local-only entries, editing/deletion, and export behavior.
- Keep private-state language explicit in all three languages.

### Profile

- Keep the screen mostly functional and quiet.
- Add an application-language row and System/Türkçe/English/العربية picker route.
- Preserve theme, Quran text size, statistics, subscription management, export, and data/privacy controls.

### Paywall

- Add an İhvan-specific hero slot and improve visual hierarchy.
- Keep store-provided price and purchase behavior unchanged.
- Localize benefits, recovery, legal, pending, and error states.
- Do not claim access to meal, tafsir, dua, audio, or plans that are not actually available.

## Localization architecture

### Source of truth

`src/i18n/applicationLocales.ts` defines:

- `tr`, `en`, and `ar`;
- native language names;
- text direction;
- BCP-47 resolution;
- the set of advertised locales.

The resolver preserves script/region information where relevant and falls back to English for an unsupported or retired device locale.

### Dictionaries and translation API

- `src/i18n/locales/tr.ts`, `en.ts`, and `ar.ts` contain exact-key dictionaries.
- English defines the compile-time key contract and runtime recovery baseline.
- `src/i18n/index.ts` exposes reactive `useT()` and non-reactive `translate()`.
- Screens and services receive translated strings through these boundaries; user-facing literals do not remain scattered across TSX and service files.
- Interpolation variables, notification values, accessibility intent, and store-provided prices are preserved.

All three dictionaries are bundled and work offline. Downloadable application-content packs are deferred until a later locale requires them. The screen-facing translation API must remain compatible with adding that validated pack boundary later.

### User preference and migration

The user store adds `language: 'system' | 'tr' | 'en' | 'ar'`. Existing installations migrate safely to `system`, which resolves Turkish on Turkish devices without changing any other preference or stored progress.

Changing application language does not modify:

- Quran Arabic data;
- bookmarks or last-read position;
- reading/prayer/dhikr history;
- a future meal/tafsir preference;
- theme, notification, or subscription state.

### RTL

`src/i18n/direction.ts` supplies direction, text alignment, row direction, and directional-icon helpers.

Arabic applies `direction: 'rtl'` at the root and stack content boundary. Rows, back/forward controls, chevrons, and text alignment mirror when their meaning is directional. Playback controls, numeric Quran identity, progress direction where semantically fixed, artwork, and non-directional icons do not mirror blindly.

The language picker displays each language in its native writing direction.

## Data flow

1. The persisted theme preference resolves Dawn or Vigil.
2. `useArtwork` maps the active scheme and stable ID to a registered source.
3. `ArtSlot` renders the source, safe scrim, and screen-owned overlay content.
4. The persisted language preference resolves a supported locale from the manual choice or device BCP-47 locale.
5. `useT` reads the complete bundled dictionary.
6. The root direction and screen helpers apply LTR or RTL presentation.
7. Screens retain their existing domain stores and services; localization and artwork do not own business state.

## Error handling and recovery

- Unknown locale: resolve to English without mutating Quran or user-history data.
- Missing translation at runtime: return the English value; automated release checks must catch this before production.
- Missing artwork: render the safe fallback; never throw during screen rendering.
- Invalid persisted language value: migrate to `system`.
- RTL inconsistency: direction helpers and visual tests block release.
- Font load failure: retain the existing splash failsafe and continue with platform fallback.
- Existing store migration failure: preserve the original data and report a recoverable error rather than resetting unrelated stores.
- Language changes never activate partially; the bundled dictionary is available before the preference is committed.

## Accessibility

- Interactive targets remain at least 44 by 44 points.
- Every icon-only button has a localized accessibility label.
- Selected language and theme controls expose selected state.
- Artwork does not become the only carrier of meaning.
- Text supports wrapping and platform font scaling.
- Contrast is verified in Dawn and Vigil.
- Reduced-motion settings are respected; this phase does not introduce required ambient animation.
- Focus order follows reading direction and visual hierarchy.

## Validation and release gate

Automated checks must include:

- exact key parity for Turkish, English, and Arabic;
- non-empty values and unchanged interpolation tokens;
- BCP-47 resolution and unsupported-locale fallback;
- Arabic RTL classification;
- directional icon mirroring and non-mirroring of playback controls;
- existing user-store migration;
- ArtSlot registry completeness and safe missing-art behavior;
- existing unit tests;
- TypeScript typecheck and lint;
- Android production export.

Visual checks cover the major screens in:

- Turkish Dawn and Vigil;
- English Dawn and Vigil;
- Arabic Dawn and Vigil.

The visual pass verifies truncation, wrapping, RTL order, touch targets, artwork crop, scrim contrast, keyboard avoidance, safe areas, and bottom-tab readability. Existing Quran, prayer-time, qibla, notification, progress, purchase, data-export, and data-deletion flows receive focused regression checks.

## Delivery order

1. Add the three-locale foundation, persisted preference migration, translation tests, and RTL helpers.
2. Move shared navigation, errors, notifications, settings, and screen chrome to translation keys.
3. Add the typed artwork registry, `useArtwork`, `ArtSlot`, safe fallback, and tests.
4. Produce and optimize the approved İhvan artwork inventory.
5. Redesign onboarding, Today, Quran, Worship, Journal, Profile, and paywall without replacing domain logic.
6. Complete Turkish, English, and Arabic copy; verify sacred-content boundaries.
7. Run automated, visual, Android production-export, and regression gates.
8. Prepare a separate proposal for the audited second feature package: personalized onboarding, ayah actions, curated Quran plans, verified guided dua playback, and contextual premium entry points.

## Acceptance criteria

- İhvan has an original Islamic visual identity with no reused Lumen Christian art.
- All approved art slots render safely in Dawn and Vigil.
- Turkish, English, and Arabic can be selected manually or through System preference and work offline.
- Arabic major screens are coherent RTL layouts.
- No user-facing raw translation keys or debug artwork IDs appear in production.
- Quran Arabic text and all existing user progress remain unchanged.
- Application-language changes do not alter Quran or future meal/tafsir preferences.
- Existing prayer, qibla, dhikr, notification, progress, subscription, export, and deletion features continue to work.
- Typecheck, lint, tests, Android production export, and representative visual checks pass before merge.
