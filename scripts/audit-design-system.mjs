import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const manifest = JSON.parse(await read('docs/qa/critical-screens.json'));

assert.deepEqual(manifest.locales, ['tr', 'en', 'ar'], 'visual QA must cover TR, EN and AR');
assert.deepEqual(manifest.themes, ['dawn', 'vigil'], 'visual QA must cover both themes');
assert.deepEqual(manifest.viewports.map(({ name }) => name), ['small', 'standard', 'tablet'], 'visual QA needs small, standard and tablet viewports');
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

console.log(`Design audit passed: ${manifest.scenarios.length} scenarios × ${manifest.locales.length} locales × ${manifest.themes.length} themes × ${manifest.viewports.length} viewports.`);
