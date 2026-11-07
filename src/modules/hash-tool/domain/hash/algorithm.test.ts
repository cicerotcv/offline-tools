import { describe, expect, it } from 'vitest';

import { ALGORITHM_HEX_LENGTH, formatHashHex } from './algorithm';

describe('formatHashHex', () => {
  it('formats hash as lowercase by default', () => {
    expect(formatHashHex('ABCD1234', 'lower')).toBe('abcd1234');
  });

  it('formats hash as uppercase when requested', () => {
    expect(formatHashHex('abcd1234', 'upper')).toBe('ABCD1234');
  });
});

describe('ALGORITHM_HEX_LENGTH', () => {
  it('defines expected digest lengths', () => {
    expect(ALGORITHM_HEX_LENGTH.sha256).toBe(64);
    expect(ALGORITHM_HEX_LENGTH.sha512).toBe(128);
    expect(ALGORITHM_HEX_LENGTH.md5).toBe(32);
  });
});
