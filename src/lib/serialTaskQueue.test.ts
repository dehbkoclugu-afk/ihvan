import assert from 'node:assert/strict';
import test from 'node:test';
import { createSerialTaskQueue } from './serialTaskQueue.ts';

test('serial task queue preserves invocation order', async () => {
  const enqueue = createSerialTaskQueue();
  const events: string[] = [];
  let releaseFirst: (() => void) | undefined;

  const first = enqueue(async () => {
    events.push('first:start');
    await new Promise<void>((resolve) => { releaseFirst = resolve; });
    events.push('first:end');
    return 1;
  });
  const second = enqueue(async () => {
    events.push('second:start');
    events.push('second:end');
    return 2;
  });

  await Promise.resolve();
  assert.deepEqual(events, ['first:start']);
  releaseFirst?.();
  assert.deepEqual(await Promise.all([first, second]), [1, 2]);
  assert.deepEqual(events, ['first:start', 'first:end', 'second:start', 'second:end']);
});

test('a rejected task does not poison later work', async () => {
  const enqueue = createSerialTaskQueue();
  const failure = enqueue(async () => { throw new Error('failed'); });
  const recovery = enqueue(async () => 'recovered');

  await assert.rejects(failure, /failed/);
  assert.equal(await recovery, 'recovered');
});
