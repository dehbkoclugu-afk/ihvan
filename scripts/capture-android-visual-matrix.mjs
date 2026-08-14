import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const packageName = 'com.ihvan.quran';
const outputDirectory = path.resolve(process.argv[2] ?? 'screenshots-matrix');
const manifest = JSON.parse(readFileSync(new URL('../docs/qa/critical-screens.json', import.meta.url), 'utf8'));
const delayMs = Number(process.env.QA_SCREENSHOT_DELAY_MS ?? 1400);

function adb(...args) {
  return execFileSync('adb', args, { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 32 * 1024 * 1024 });
}

function adbShell(command) {
  return adb('shell', command);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pngDimensions(buffer) {
  if (buffer.toString('ascii', 1, 4) !== 'PNG') throw new Error('screencap did not return a PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function launchUrl(url) {
  const command = `am start -W -a android.intent.action.VIEW -d '${url}' ${packageName}`;
  adbShell(command);
}

async function captureStableScreenshot(viewport, fileName) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const screenshot = adb('exec-out', 'screencap', '-p');
      const dimensions = pngDimensions(screenshot);
      if (dimensions.width !== viewport.width || dimensions.height !== viewport.height) {
        throw new Error(`expected ${viewport.width}x${viewport.height}, received ${dimensions.width}x${dimensions.height}`);
      }
      if (screenshot.length < 5_000) throw new Error(`received only ${screenshot.length} bytes`);
      return screenshot;
    } catch (error) {
      lastError = error;
      if (attempt < 5) await wait(1_000);
    }
  }
  throw new Error(`${fileName}: stable screenshot unavailable after 5 attempts: ${lastError}`);
}

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

const hashes = new Set();
let screenshotCount = 0;

try {
  adbShell('settings put global transition_animation_scale 0');
  adbShell('settings put global window_animation_scale 0');
  adbShell('settings put global animator_duration_scale 0');

  for (const viewport of manifest.viewports) {
    adbShell(`wm size ${viewport.width}x${viewport.height}`);
    adbShell('wm density 160');
    await wait(2_500);

    for (const fontScale of manifest.fontScales) {
      adbShell(`settings put system font_scale ${fontScale}`);
      await wait(600);

      for (const theme of manifest.themes) {
        adbShell(`cmd uimode night ${theme === 'vigil' ? 'yes' : 'no'}`);
        await wait(600);

        for (const locale of manifest.locales) {
          for (const target of manifest.androidSmokeTargets) {
            const fileName = [viewport.name, `font-${String(fontScale).replace('.', '-')}`, theme, locale, target].join('__') + '.png';
            const url = `ihvan://visual-qa?locale=${locale}&theme=${theme}&quranTextSize=medium&target=${target}`;
            launchUrl(url);
            await wait(delayMs);

            const screenshot = await captureStableScreenshot(viewport, fileName);

            writeFileSync(path.join(outputDirectory, fileName), screenshot);
            hashes.add(createHash('sha256').update(screenshot).digest('hex'));
            screenshotCount += 1;
          }
        }
      }
    }
  }
} finally {
  try { adbShell('settings put system font_scale 1.0'); } catch {}
  try { adbShell('wm size reset'); } catch {}
  try { adbShell('wm density reset'); } catch {}
}

const expectedCount = manifest.viewports.length
  * manifest.fontScales.length
  * manifest.themes.length
  * manifest.locales.length
  * manifest.androidSmokeTargets.length;

if (screenshotCount !== expectedCount) throw new Error(`expected ${expectedCount} screenshots, captured ${screenshotCount}`);
if (hashes.size < Math.ceil(expectedCount * 0.6)) throw new Error(`only ${hashes.size}/${expectedCount} screenshots are visually distinct`);

console.log(`Android visual QA matrix passed: ${screenshotCount} screenshots, ${hashes.size} distinct images.`);
