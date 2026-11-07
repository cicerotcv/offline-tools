import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  bytesToHex,
  concatBytes,
  constantTimeEqual,
  hexToBytes,
} from './bytes';

describe('bytes', () => {
  it('hex round trip', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 128 }), (bytes) => {
        const hex = bytesToHex(bytes);
        expect(hex).toMatch(/^([0-9a-f]{2})*$/);
        expect(Array.from(hexToBytes(hex))).toEqual(Array.from(bytes));
      })
    );
  });

  it('rejects malformed hex', () => {
    expect(() => hexToBytes('abc')).toThrow();
    expect(() => hexToBytes('zz')).toThrow();
    expect(Array.from(hexToBytes('FF00'))).toEqual([255, 0]);
  });

  it('concatenates in order', () => {
    expect(
      Array.from(concatBytes(new Uint8Array([1]), new Uint8Array([2, 3])))
    ).toEqual([1, 2, 3]);
  });

  it('compares equal and unequal arrays', () => {
    fc.assert(
      fc.property(fc.uint8Array(), fc.uint8Array(), (a, b) => {
        const same = a.length === b.length && a.every((v, i) => v === b[i]);
        expect(constantTimeEqual(a, b)).toBe(same);
        expect(constantTimeEqual(a, a.slice())).toBe(true);
      })
    );
  });
});
