import { createHash } from 'node:crypto';

export function launchFresh({ forceStop, launch, url }) {
  forceStop();
  launch(url);
}

function validateScreenshot(screenshot, viewport, minimumBytes) {
  if (screenshot.toString('ascii', 1, 4) !== 'PNG') throw new Error('screencap did not return a PNG');
  const width = screenshot.readUInt32BE(16);
  const height = screenshot.readUInt32BE(20);
  if (width !== viewport.width || height !== viewport.height) {
    throw new Error(`expected ${viewport.width}x${viewport.height}, received ${width}x${height}`);
  }
  if (screenshot.length < minimumBytes) throw new Error(`received only ${screenshot.length} bytes`);
}

export async function captureStableScreenshot({
  capture,
  wait,
  viewport,
  fileName,
  maxAttempts = 8,
  pollMs = 750,
  minimumBytes = 5_000,
}) {
  let previousHash;
  let lastError = 'frames kept changing';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const screenshot = capture();
      validateScreenshot(screenshot, viewport, minimumBytes);
      const hash = createHash('sha256').update(screenshot).digest('hex');
      if (hash === previousHash) return screenshot;
      previousHash = hash;
      lastError = 'frames kept changing';
    } catch (error) {
      previousHash = undefined;
      lastError = error;
    }
    if (attempt < maxAttempts) await wait(pollMs);
  }

  throw new Error(`${fileName}: stable screenshot unavailable after ${maxAttempts} attempts: ${lastError}`);
}
