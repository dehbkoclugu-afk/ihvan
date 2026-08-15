import assert from 'node:assert/strict';
import test from 'node:test';
import { captureStableScreenshot, launchFresh } from './android-screenshot-stability.mjs';

function png(width, height, marker) {
  const buffer = Buffer.alloc(6_000, marker);
  buffer.write('PNG', 1, 'ascii');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

test('force-stops before launching a visual QA URL', () => {
  const calls = [];
  launchFresh({
    forceStop: () => calls.push('stop'),
    launch: (url) => calls.push(url),
    url: 'ihvan://visual-qa?target=paywall',
  });
  assert.deepEqual(calls, ['stop', 'ihvan://visual-qa?target=paywall']);
});

test('returns only after two consecutive eligible frames match', async () => {
  const frames = [png(320, 693, 1), png(320, 693, 2), png(320, 693, 2)];
  const result = await captureStableScreenshot({
    capture: () => frames.shift(),
    wait: async () => {},
    viewport: { width: 320, height: 693 },
    fileName: 'small__font-1-3__vigil__ar__quran.png',
    maxAttempts: 3,
    pollMs: 0,
    minimumBytes: 5_000,
  });
  assert.equal(result[100], 2);
});

test('ignores wrong-size frames and requires a fresh matching pair', async () => {
  const frames = [png(412, 915, 3), png(320, 693, 4), png(320, 693, 4)];
  const result = await captureStableScreenshot({
    capture: () => frames.shift(),
    wait: async () => {},
    viewport: { width: 320, height: 693 },
    fileName: 'small.png',
    maxAttempts: 3,
    pollMs: 0,
  });
  assert.equal(result[100], 4);
});

test('fails with the filename when frames never stabilize', async () => {
  const frames = [png(320, 693, 1), png(320, 693, 2), png(320, 693, 3)];
  await assert.rejects(
    captureStableScreenshot({
      capture: () => frames.shift(),
      wait: async () => {},
      viewport: { width: 320, height: 693 },
      fileName: 'changing.png',
      maxAttempts: 3,
      pollMs: 0,
    }),
    /changing\.png: stable screenshot unavailable after 3 attempts/,
  );
});
