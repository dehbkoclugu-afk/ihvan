# İhvan Android Release Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Produce a Play-accepted İhvan 1.0.0 Android release whose billing, restore, privacy, and critical device flows are verified before production rollout.

**Architecture:** Keep the existing Expo/React Native application and GitHub Actions release boundary. Add only deterministic release metadata, stricter RevenueCat contract validation, machine-checkable release gates, and human QA/store checklists; Play Console and RevenueCat remain external sources of truth.

**Tech Stack:** Expo 53, React Native 0.79, TypeScript, Node test runner, RevenueCat, Google Play Billing, GitHub Actions, EAS.

## Global Constraints

- Never modify bundled Quran source text or generated Quran data during release work.
- Never commit keystores, API keys, service-account JSON, passwords, or live purchase receipts.
- Keep Android package name com.ihvan.quran and entitlement ID ihvan_plus.
- Do not add new product features, locales, analytics, account systems, meal, tafsir, or dua content.
- Every code task must pass npm test, npm run typecheck, npm run lint, and git diff --check before commit.

---

## File and responsibility map

- app.json: public app identity, semantic version, Android package and native plugin configuration.
- package.json: JavaScript package metadata and verification commands.
- eas.json: EAS build and internal-submit configuration.
- src/services/purchases.logic.ts: pure RevenueCat package and entitlement decisions.
- src/services/purchases.ts: native RevenueCat boundary and runtime fallback behavior.
- src/services/purchases.test.ts: pure billing contract regression tests.
- src/lib/releaseConfig.test.ts: repository-level release and secret-boundary checks.
- .github/workflows/android-release.yml: signed AAB/APK production-like build.
- .github/workflows/eas-release.yml: EAS build and optional Play internal submission.
- docs/RELEASE_AUTOMATION.md: operator instructions for release workflows.
- docs/release/ANDROID_RELEASE_CHECKLIST.md: end-to-end release gate.
- docs/release/ANDROID_DEVICE_QA.md: real-device acceptance matrix and evidence format.
- docs/release/PLAY_CONSOLE_VALUES.md: exact Console/RevenueCat identifiers and declarations.

### Task 1: Lock release identity and versions

**Files:**
- Modify: app.json
- Modify: package.json
- Modify: src/lib/releaseConfig.test.ts

**Interfaces:**
- Consumes: appConfig.expo.version, appConfig.expo.android.package, packageConfig.version
- Produces: one canonical 1.0.0 release identity for com.ihvan.quran

- [ ] **Step 1: Write the failing release identity test**

  Extend src/lib/releaseConfig.test.ts to load package.json and assert:

  ~~~ts
  const packageConfig = JSON.parse(readFileSync('package.json', 'utf8')) as {
    version: string;
  };

  test('Android 1.0 release identity is canonical', () => {
    assert.equal(appConfig.expo.version, '1.0.0');
    assert.equal(packageConfig.version, '1.0.0');
    assert.equal((appConfig.expo.android as { package?: string }).package, 'com.ihvan.quran');
  });
  ~~~

- [ ] **Step 2: Run the test and verify the expected failure**

  Run npm test. Expect the new assertion to report appConfig.expo.version as 0.1.0.

- [ ] **Step 3: Implement the minimum metadata change**

  Set expo.version in app.json to 1.0.0. Leave package.json version at its existing 1.0.0 and do not add android.versionCode because the signed workflow injects it.

- [ ] **Step 4: Run verification**

  Run npm test, npm run typecheck, npm run lint, npx expo config --type public, and git diff --check. Expect all commands to succeed and the public Expo config to show version 1.0.0 and package com.ihvan.quran.

- [ ] **Step 5: Commit**

  Commit app.json, package.json only if changed, and src/lib/releaseConfig.test.ts with message: chore: lock Android 1.0 release identity

### Task 2: Make the RevenueCat contract exact

**Files:**
- Modify: src/services/purchases.logic.ts
- Modify: src/services/purchases.ts
- Modify: src/services/purchases.test.ts
- Modify: app/paywall.tsx
- Modify: src/lib/releaseConfig.test.ts

**Interfaces:**
- Consumes: RevenueCat packageType, package identifier, active entitlement map, EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID
- Produces: monthly and annual PlanId values and entitlement lookup limited to ihvan_plus

- [ ] **Step 1: Write failing billing contract tests**

  Replace the permissive entitlement test and add exact package assertions:

  ~~~ts
  test('recognizes only the canonical Ihvan Plus entitlement', () => {
    assert.equal(hasActiveEntitlement({ ihvan_plus: {} }, ['ihvan_plus']), true);
    assert.equal(hasActiveEntitlement({ plus: {} }, ['ihvan_plus']), false);
    assert.equal(hasActiveEntitlement({ 'Ihvan Plus': {} }, ['ihvan_plus']), false);
  });

  test('maps only supported subscription packages', () => {
    assert.equal(planIdForPackage('ANNUAL', '$rc_annual'), 'annual');
    assert.equal(planIdForPackage('MONTHLY', '$rc_monthly'), 'monthly');
    assert.equal(planIdForPackage('LIFETIME', '$rc_lifetime'), null);
  });
  ~~~

  Add a releaseConfig test asserting android-release.yml exports EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID: ihvan_plus.

- [ ] **Step 2: Run tests and verify expected failures**

  Run npm test. Expect the lifetime mapping assertion to fail and confirm the release workflow assertion passes.

- [ ] **Step 3: Narrow the production contract**

  Change PlanId to monthly | annual. Remove lifetime handling from planIdForPackage and DEV_PLANS. Replace the entitlementIds alias array in purchases.ts with one canonical ID:

  ~~~ts
  const entitlementId =
    process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() || 'ihvan_plus';
  ~~~

  Pass [entitlementId] to hasActiveEntitlement. Do not change cancellation, pending-payment, unavailable-offering, or restore behavior.

  Change the names map in app/paywall.tsx to:

  ~~~ts
  const names: Record<PlanId, string> = {
    annual: 'Yıllık',
    monthly: 'Aylık',
  };
  ~~~

- [ ] **Step 4: Run verification**

  Run npm test, npm run typecheck, npm run lint, and git diff --check. Expect all billing tests to pass and no remaining lifetime PlanId reference outside historical documentation.

- [ ] **Step 5: Commit**

  Commit the five modified files with message: fix: lock RevenueCat release contract

### Task 3: Add machine-checkable release gates

**Files:**
- Modify: src/lib/releaseConfig.test.ts
- Modify: .github/workflows/android-release.yml
- Modify: docs/RELEASE_AUTOMATION.md

**Interfaces:**
- Consumes: workflow inputs version_code and release_confirmed
- Produces: a signed build only after explicit release confirmation and positive versionCode validation

- [ ] **Step 1: Write failing workflow assertions**

  Add assertions that android-release.yml contains:

  ~~~ts
  assert.ok(signed.includes('release_confirmed:'));
  assert.ok(signed.includes('inputs.release_confirmed'));
  assert.ok(signed.includes('Confirm Android release'));
  ~~~

- [ ] **Step 2: Run the test and verify expected failure**

  Run npm test. Expect release_confirmed to be missing.

- [ ] **Step 3: Add an explicit workflow gate**

  Add a required boolean workflow_dispatch input named release_confirmed with default false. Add a first job step named Confirm Android release that exits unless the input is true. Preserve all existing secret checks, signature checks, emulator smoke, and artifact retention.

- [ ] **Step 4: Document the operator sequence**

  Update docs/RELEASE_AUTOMATION.md to require: choose a versionCode above Play's current maximum, confirm the release input, download the AAB SHA-256, upload to internal testing, and retain the workflow run URL.

- [ ] **Step 5: Run verification**

  Run npm test and parse every workflow with:

  ~~~bash
  ruby -e "require 'yaml'; Dir['.github/workflows/*.yml'].each { |f| YAML.load_file(f) }"
  ~~~

  Then run git diff --check. Expect success.

- [ ] **Step 6: Commit**

  Commit the three files with message: ci: gate signed Android releases

### Task 4: Create the real-device acceptance protocol

**Files:**
- Create: docs/release/ANDROID_DEVICE_QA.md
- Modify: src/lib/releaseConfig.test.ts

**Interfaces:**
- Consumes: signed APK SHA-256, device model, Android version, test timestamp
- Produces: one PASS/FAIL evidence row per critical user flow

- [ ] **Step 1: Write a failing documentation-presence test**

  Add a test that reads docs/release/ANDROID_DEVICE_QA.md and asserts it contains the section labels Clean install, Quran integrity, Location, Qibla, Notifications, Purchase, Restore, Data export, Accessibility, Offline, and Evidence.

- [ ] **Step 2: Run npm test and verify ENOENT**

  Expect the test to fail because the QA document does not exist.

- [ ] **Step 3: Write the QA matrix**

  Create the document with columns: ID, device/API, precondition, actions, expected result, result, evidence. Define exact scenarios for clean install/onboarding, all Quran navigation modes, bookmark/last-read persistence, foreground-location grant/deny/revoke, qibla without sensor, Android 13+ notification permission, prayer rescheduling, local habit persistence, JSON export cleanup, large font/screen reader, offline launch, purchase cancellation, purchase success, and restore after clearing app data.

- [ ] **Step 4: Define severity and exit rules**

  In the same file define Blocker as install/launch/payment/data-loss failure, Critical as a broken core Quran/prayer flow, Major as a usable but materially degraded flow, and Minor as cosmetic. Require zero open Blocker or Critical results.

- [ ] **Step 5: Run verification**

  Run npm test and git diff --check. Expect the documentation test to pass.

- [ ] **Step 6: Commit**

  Commit the QA document and test with message: docs: add Android device acceptance protocol

### Task 5: Create exact Play Console and RevenueCat setup values

**Files:**
- Create: docs/release/PLAY_CONSOLE_VALUES.md
- Modify: src/lib/releaseConfig.test.ts

**Interfaces:**
- Consumes: package com.ihvan.quran, entitlement ihvan_plus, monthly and annual plans
- Produces: copy-safe identifiers and a completion checklist for the two consoles

- [ ] **Step 1: Write the failing values-document test**

  Assert the new file contains com.ihvan.quran, ihvan_plus, monthly, annual, Google Play service account, license tester, foreground location, background location: not used, and purchase data.

- [ ] **Step 2: Run npm test and verify ENOENT**

  Expect failure because the values document is missing.

- [ ] **Step 3: Create the console values document**

  Define canonical product IDs ihvan_plus_monthly and ihvan_plus_annual. State that the RevenueCat default offering maps $rc_monthly and $rc_annual to these products and grants ihvan_plus. Include ordered Console steps, but leave secret values out of the document.

- [ ] **Step 4: Add policy declarations**

  Record: foreground location is used on device for prayer times/qibla; background location is not used; local notifications are opt-in; personal journal/habit data remains local unless the user explicitly exports it; purchase data is processed by Google Play and RevenueCat. Require the operator to reconcile these statements with the current Play Data safety form before submission.

- [ ] **Step 5: Run verification**

  Run npm test, npm run typecheck, and git diff --check. Expect success.

- [ ] **Step 6: Commit**

  Commit the values document and test with message: docs: define Play and RevenueCat release values

### Task 6: Add the master Android release checklist

**Files:**
- Create: docs/release/ANDROID_RELEASE_CHECKLIST.md
- Modify: src/lib/releaseConfig.test.ts
- Modify: README.md

**Interfaces:**
- Consumes: commits and evidence from Tasks 1–5
- Produces: a single no-skip go/no-go release decision

- [ ] **Step 1: Write the failing checklist test**

  Assert the checklist contains Phase 0 through Phase 6, GO, NO-GO, AAB SHA-256, versionCode, Play pre-launch report, RevenueCat purchase, restore, staged rollout, and 72-hour monitoring.

- [ ] **Step 2: Run npm test and verify ENOENT**

  Expect failure because the master checklist is missing.

- [ ] **Step 3: Create the checklist**

  Turn every roadmap exit criterion into an unchecked checkbox. Add evidence fields for release commit SHA, workflow URL, AAB SHA-256, Play release ID, tested devices, test purchaser account alias, purchase timestamp, and RevenueCat customer record confirmation. Do not request passwords, raw receipts, API keys, or service-account contents.

- [ ] **Step 4: Add go/no-go rules**

  GO requires all automated checks, signed build smoke, device QA, purchase, restore, Console declarations, and mandatory Play testing to pass. Any missing payment evidence, Quran integrity failure, Blocker/Critical defect, signing mismatch, or policy mismatch is NO-GO.

- [ ] **Step 5: Link the release documentation**

  Add a Release preparation section to README.md linking to RELEASE_AUTOMATION.md, ANDROID_DEVICE_QA.md, PLAY_CONSOLE_VALUES.md, and ANDROID_RELEASE_CHECKLIST.md.

- [ ] **Step 6: Run verification**

  Run npm test, npm run typecheck, npm run lint, and git diff --check. Expect success.

- [ ] **Step 7: Commit**

  Commit the checklist, test, and README with message: docs: add Android release gate

### Task 7: Execute repository-wide release verification

**Files:**
- Verify: all tracked files
- Generated then remove: android/, ios/, dist/

**Interfaces:**
- Consumes: release candidate HEAD
- Produces: reproducible CI-equivalent verification evidence

- [ ] **Step 1: Install from the lockfile**

  Run npm ci with a writable task-local cache, for example npm_config_cache=/tmp/ihvan-npm-cache npm ci. Expect a clean install.

- [ ] **Step 2: Run static and unit checks**

  Run npm test, npm run typecheck, npm run lint, and npx expo-doctor@1.20.1. Expect all tests and all Expo Doctor checks to pass.

- [ ] **Step 3: Verify app outputs**

  Run npx expo config --type public, npx expo export --platform web, npx expo prebuild --no-install --clean, and node scripts/verify-native-config.mjs. Expect successful export/prebuild and native package/privacy verification.

- [ ] **Step 4: Verify Quran integrity explicitly**

  Run:

  ~~~bash
  node --experimental-strip-types --test src/data/quran.integrity.test.ts
  ~~~

  Expect the Tanzil fingerprint, 114-surah, 6,236-ayah, and 30-juz checks to pass.

- [ ] **Step 5: Clean generated outputs safely**

  Confirm android, ios, and dist are generated and ignored with git status --ignored --short, then remove only those three repository-local generated directories. Do not remove any tracked path.

- [ ] **Step 6: Record the verification commit**

  If verification required no source change, do not create an empty commit. Record the successful commands and HEAD SHA in the master checklist during actual release execution.

### Task 8: External release execution gate

**Files:**
- Update during execution: docs/release/ANDROID_RELEASE_CHECKLIST.md
- Evidence only: GitHub Actions run, Play Console release, RevenueCat customer record

**Interfaces:**
- Consumes: Google Play, RevenueCat, GitHub Actions credentials controlled by the user
- Produces: internal/closed-test AAB approval followed by staged production rollout

- [ ] **Step 1: Configure external products**

  Follow PLAY_CONSOLE_VALUES.md to create monthly and annual Play products, connect the RevenueCat service account, create the ihvan_plus entitlement, and publish the default offering.

- [ ] **Step 2: Configure secrets**

  Add ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD, and EXPO_PUBLIC_REVENUECAT_ANDROID_KEY to GitHub Actions. Never paste secret values into issues, commits, logs, or the checklist.

- [ ] **Step 3: Build and upload the candidate**

  Run Android Signed Release with release_confirmed true and a versionCode above Play's current maximum. Upload the resulting AAB unchanged to internal testing and record its SHA-256 and workflow URL.

- [ ] **Step 4: Execute device and billing QA**

  Complete every ANDROID_DEVICE_QA.md row on the internal/closed-test build. Perform a real license-test purchase, app-data-clear restore, cancellation, and offline fallback. Record non-secret evidence.

- [ ] **Step 5: Complete Play gates**

  Resolve actionable pre-launch findings, complete store listing and Data safety forms, satisfy the account's mandatory closed-test requirement, and mark every applicable checklist item.

- [ ] **Step 6: Make the go/no-go decision**

  Release only if ANDROID_RELEASE_CHECKLIST.md evaluates GO. Otherwise stop, create a narrowly scoped fix task, increment versionCode, rebuild, and repeat affected acceptance rows.

- [ ] **Step 7: Stage production rollout**

  Promote the verified AAB to production at 10 percent, then 50 percent after 24 clean hours, then 100 percent after another 24–48 clean hours where Play supports staged rollout.

- [ ] **Step 8: Monitor and close**

  For 72 hours review Android vitals, crash/ANR, Play reviews, RevenueCat purchase/restore events, and support messages. Stop rollout for payment, data-loss, install, launch, or Quran integrity failures; route non-critical defects to 1.0.1.

## Final verification matrix

| Requirement | Task |
|---|---|
| Canonical version/package | 1 |
| Exact RevenueCat entitlement/products | 2, 5 |
| Explicit signed-build gate | 3 |
| Real-device QA | 4, 8 |
| Purchase and restore | 2, 5, 8 |
| Signed AAB and pre-launch report | 3, 8 |
| Store and Data safety declarations | 5, 6, 8 |
| Automated release checks | 1–3, 7 |
| Quran content protection | Global constraints, 7 |
| Staged rollout and 72-hour monitoring | 6, 8 |
