import { describe, expect, it } from 'vitest';

import { GLYPHS, measureText, textToPath } from './stroke-font';

const BASE64URL =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

describe('stroke font', () => {
  it('has a glyph for every base64url character and the plate text', () => {
    for (const char of `${BASE64URL} /.:·`) {
      expect(GLYPHS[char], char).toBeDefined();
    }
  });

  it('draws the ambiguous pairs differently', () => {
    const same = (a: string, b: string) =>
      JSON.stringify(GLYPHS[a]) === JSON.stringify(GLYPHS[b]);
    for (const [a, b] of [
      ['0', 'O'],
      ['1', 'l'],
      ['1', 'I'],
      ['l', 'I'],
      ['-', '_'],
      ['o', '0'],
    ]) {
      expect(same(a, b), `${a} vs ${b}`).toBe(false);
    }
    // The slashed zero has one stroke more than O.
    expect(GLYPHS['0'].length).toBe(GLYPHS.O.length + 1);
  });

  it('keeps every stroke within the glyph box', () => {
    for (const [char, glyph] of Object.entries(GLYPHS)) {
      for (const [x, y] of glyph.flat()) {
        expect(x, char).toBeGreaterThanOrEqual(-0.5);
        expect(x, char).toBeLessThanOrEqual(4.5);
        expect(y, char).toBeGreaterThanOrEqual(-0.5);
        expect(y, char).toBeLessThanOrEqual(10);
      }
    }
  });

  it('places text at a cap height in mm and measures it', () => {
    expect(textToPath('I', { x: 0, y: 8, capHeight: 8 })).toBe(
      'M1 0L3 0M2 0L2 8M1 8L3 8'
    );
    expect(measureText('ABCD', 4)).toBeCloseTo(((3 * 6 + 4) * 4) / 8);
    expect(() => textToPath('é', { x: 0, y: 0, capHeight: 3 })).toThrow(
      /No engraving glyph/
    );
  });
});
