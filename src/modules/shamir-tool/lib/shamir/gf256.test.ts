import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { gf256Inverse, gf256Multiply } from './shamir';

const byte = fc.integer({ min: 0, max: 255 });

describe('GF(256) with the AES polynomial x^8 + x^4 + x^3 + x + 1', () => {
  it('matches the FIPS-197 worked examples', () => {
    expect(gf256Multiply(0x57, 0x83)).toBe(0xc1);
    expect(gf256Multiply(0x57, 0x13)).toBe(0xfe);
  });

  it('every non-zero element times its inverse is 1', () => {
    for (let a = 1; a < 256; a++) {
      expect(gf256Multiply(a, gf256Inverse(a))).toBe(1);
    }
  });

  it('has no inverse for 0', () => {
    expect(() => gf256Inverse(0)).toThrow();
  });

  it('is commutative, associative and distributes over XOR', () => {
    fc.assert(
      fc.property(byte, byte, byte, (a, b, c) => {
        expect(gf256Multiply(a, b)).toBe(gf256Multiply(b, a));
        expect(gf256Multiply(gf256Multiply(a, b), c)).toBe(
          gf256Multiply(a, gf256Multiply(b, c))
        );
        expect(gf256Multiply(a, b ^ c)).toBe(
          gf256Multiply(a, b) ^ gf256Multiply(a, c)
        );
      })
    );
  });
});
