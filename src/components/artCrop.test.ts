import assert from 'node:assert/strict';
import test from 'node:test';
import { coverCropFrame } from './artCrop.ts';

test('centers a landscape image in a wide slot without distortion', () => {
  assert.deepEqual(coverCropFrame({ width: 600, height: 100 }, { width: 1200, height: 800 }), {
    width: 600,
    height: 400,
    left: 0,
    top: -150,
  });
});

test('keeps the requested focal point visible and clamps crop edges', () => {
  assert.deepEqual(coverCropFrame({ width: 300, height: 300 }, { width: 1200, height: 600 }, { x: 0.25, y: 0.5 }), {
    width: 600,
    height: 300,
    left: 0,
    top: 0,
  });
  assert.equal(coverCropFrame({ width: 0, height: 300 }, { width: 1200, height: 600 }), null);
});

test('positions the important vertical region of a portrait asset in a wide slot', () => {
  const frame = coverCropFrame({ width: 620, height: 236 }, { width: 1024, height: 1536 }, { x: 0.5, y: 0.43 });
  assert.ok(frame);
  assert.equal(frame.width, 620);
  assert.equal(frame.left, 0);
  assert.ok(frame.top < 0);
  const focalYInSlot = frame.top + frame.height * 0.43;
  assert.ok(focalYInSlot >= 0 && focalYInSlot <= 236);
});

test('rejects non-finite dimensions and normalizes an invalid focal point', () => {
  assert.equal(coverCropFrame({ width: Number.NaN, height: 300 }, { width: 1200, height: 600 }), null);
  assert.equal(coverCropFrame({ width: 300, height: 300 }, { width: Number.POSITIVE_INFINITY, height: 600 }), null);
  assert.deepEqual(coverCropFrame({ width: 300, height: 300 }, { width: 1200, height: 600 }, { x: Number.NaN, y: Number.NaN }), {
    width: 600,
    height: 300,
    left: -150,
    top: 0,
  });
});
