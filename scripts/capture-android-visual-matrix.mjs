import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { captureStableScreenshot, launchFresh } from './android-screenshot-stability.mjs';

const packageName = 'com.ihvan.quran';
const outputDirectory = path.resolve(process.argv[2] ?? 'screenshots-matrix');
const manifest = JSON.parse(readFileSync(new URL('../docs/qa/critical-screens.json', import.meta.url), 'utf8'));
const delayMs = Number(process.env.QA_SCREENSHOT_DELAY_MS ?? 3500);

function adb(...args) {
  return execFileSync('adb', args, { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 32 * 1024 * 1024 });
}

function adbShell(command) {
  return adb('shell', command);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function launchUrl(url) {
  const command = `am start -W -a android.intent.action.VIEW -d '${url}' ${packageName}`;
  adbShell(command);
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
            launchFresh({
              forceStop: () => adbShell(`am force-stop ${packageName}`),
              launch: launchUrl,
              url,
            });
            await wait(delayMs);

            const screenshot = await captureStableScreenshot({
              capture: () => adb('exec-out', 'screencap', '-p'),
              wait,
              viewport,
              fileName,
            });

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
