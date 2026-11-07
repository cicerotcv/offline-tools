import { describe, expect, it } from 'vitest';

import { assessHexEntropy } from './quality';

describe('assessHexEntropy', () => {
  it.each([
    ['0'.repeat(32), 'single symbol'],
    ['ab'.repeat(16), 'two symbols'],
    ['0123456789abcdef'.repeat(2), 'repeated 16-symbol pattern'],
    ['7f7f7f7f00000000f3a91c2b4d6e8a01', 'long run of zeros'],
  ])('flags %s (%s)', (hex) => {
    expect(assessHexEntropy(hex).looksWeak).toBe(true);
  });

  it('accepts a random-looking 128-bit value', () => {
    const quality = assessHexEntropy('9e885d952ad362caeb4efe34a8e91bd2');
    expect(quality.looksWeak).toBe(false);
    expect(quality.period).toBeNull();
  });

  it('does not judge very short input', () => {
    expect(assessHexEntropy('000').looksWeak).toBe(false);
  });
});
