import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio } from './contrast.ts';
import { themes } from './tokens.ts';

test('semantic text and action colors meet WCAG AA in both themes', () => {
  for (const [name, colors] of Object.entries(themes)) {
    const pairs = [
      ['background text', colors.bg, colors.ink],
      ['background secondary text', colors.bg, colors.inkSoft],
      ['background faint text', colors.bg, colors.inkFaint],
      ['surface text', colors.surface, colors.ink],
      ['surface secondary text', colors.surface, colors.inkSoft],
      ['primary action', colors.gold, colors.onGold],
      ['danger text', colors.bg, colors.danger],
    ] as const;
    for (const [label, background, foreground] of pairs) {
      assert.ok(contrastRatio(background, foreground) >= 4.5, `${name} ${label} must meet 4.5:1`);
    }
  }
});
