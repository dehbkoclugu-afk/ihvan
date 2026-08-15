import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const manifest = JSON.parse(await read('docs/qa/critical-screens.json'));
const status = JSON.parse(await read('docs/qa/design-100-status.json'));

assert.deepEqual(manifest.locales, ['tr', 'en', 'ar'], 'visual QA must cover TR, EN and AR');
assert.deepEqual(manifest.themes, ['dawn', 'vigil'], 'visual QA must cover both themes');
assert.deepEqual(manifest.fontScales, [1, 1.3], 'visual QA must cover normal and 130% system font scaling');
assert.deepEqual(manifest.viewports.map(({ name }) => name), ['small', 'standard', 'tablet'], 'visual QA needs small, standard and tablet viewports');
assert.deepEqual(manifest.androidSmokeTargets, ['onboarding', 'today', 'quran', 'worship', 'journal', 'profile', 'paywall'], 'Android visual smoke targets changed unexpectedly');
assert.equal(manifest.scenarios.length, 20, 'exactly 20 critical UI scenarios must stay release-blocking');
assert.equal(new Set(manifest.scenarios.map(({ id }) => id)).size, 20, 'critical UI scenario ids must be unique');

for (const scenario of manifest.scenarios) await read(scenario.route);

const tokens = await read('src/theme/tokens.ts');
for (const size of ['xs: 4', 'sm: 8', 'md: 12', 'lg: 16', 'xl: 24', 'xxl: 32']) assert.match(tokens, new RegExp(size), `missing spacing token ${size}`);
assert.match(tokens, /minimum: 44/, 'minimum touch target must be 44');

const profile = await read('app/(tabs)/profile.tsx');
assert.doesNotMatch(profile, />%\{formatLocaleNumber/, 'percent sign must follow the localized number');
const ayahCard = await read('src/components/AyahCard.tsx');
assert.match(ayahCard, /PREVIEW_LINES = 7/, 'Today long-ayah preview must stay bounded');
assert.match(ayahCard, /openFullAyah/, 'bounded ayah preview must offer the full reader');
const art = await read('src/components/ArtSlot.tsx');
assert.match(art, /focalPoints\?\.\[artwork\.scheme\]/, 'art crop must support theme-specific focal points');

const allStatusIds = [...status.completed, ...status.partial, ...status.pending].sort((a, b) => a - b);
assert.deepEqual(allStatusIds, Array.from({ length: 100 }, (_, index) => index + 1), 'the 100-point design plan must track every item exactly once');
assert.equal(new Set(allStatusIds).size, 100, 'design status ids must not overlap');
const weightedScore = status.completed.length + status.partial.length / 2;
assert.equal(weightedScore, 93, 'design progress score changed; update the reviewed status file intentionally');
const rootLayout = await read('app/_layout.tsx');
assert.match(rootLayout, /Amiri_400Regular/, 'the dedicated Arabic font must remain bundled');
const previewWorkflow = await read('.github/workflows/android-preview.yml');
assert.match(previewWorkflow, /ihvan-preview-screenshots/, 'Android preview must upload real UI screenshots');
assert.match(previewWorkflow, /screencap/, 'Android preview must capture the running app');
assert.match(previewWorkflow, /capture-android-visual-matrix\.mjs/, 'Android preview must capture the locale, theme, viewport and font-scale matrix');
const visualQaRoute = await read('app/visual-qa.tsx');
assert.match(visualQaRoute, /EXPO_PUBLIC_VISUAL_QA === '1'/, 'the visual QA deep link must stay disabled outside dedicated preview builds');

console.log(`Design audit passed: score ${weightedScore}/100; ${manifest.scenarios.length} scenarios × ${manifest.locales.length} locales × ${manifest.themes.length} themes × ${manifest.viewports.length} viewports × ${manifest.fontScales.length} font scales.`);
