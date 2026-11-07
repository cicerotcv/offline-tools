import { describe, expect, it } from 'vitest';

import { SHAMIR_V3_VECTOR } from '../../domain/vectors/v3-vectors';
import {
  cardDensityFor,
  MAX_CARD_SECRET_BYTES,
  shareLength,
  shareRows,
} from './card-layout';

describe('card layout', () => {
  it('predicts the exact length of a v3 share', () => {
    const bytes = new TextEncoder().encode(SHAMIR_V3_VECTOR.secret).length;
    expect(shareLength(bytes)).toBe(SHAMIR_V3_VECTOR.shares[0].length);
  });

  it('picks regular, compact or dense by share length', () => {
    expect(cardDensityFor(shareLength(28))?.name).toBe('regular');
    expect(cardDensityFor(shareLength(120))?.name).toBe('compact');
    expect(cardDensityFor(shareLength(200))?.name).toBe('dense');
    expect(cardDensityFor(shareLength(MAX_CARD_SECRET_BYTES))?.name).toBe(
      'dense'
    );
    expect(cardDensityFor(shareLength(MAX_CARD_SECRET_BYTES + 1))).toBeNull();
  });

  it('fits any 24-word English BIP39 phrase, even with the longest words', () => {
    // The longest English BIP39 words have 8 letters: 24 x 8 + 23 spaces.
    expect(24 * 8 + 23).toBeLessThanOrEqual(MAX_CARD_SECRET_BYTES);
    expect(MAX_CARD_SECRET_BYTES).toBe(222);
  });

  it('never needs more rows than the density allows', () => {
    for (let bytes = 0; bytes <= MAX_CARD_SECRET_BYTES; bytes++) {
      const length = shareLength(bytes);
      const density = cardDensityFor(length)!;
      const rows = shareRows('x'.repeat(length), density.groupsPerRow);
      expect(rows.length).toBeLessThanOrEqual(density.maxRows);
    }
  });
});
