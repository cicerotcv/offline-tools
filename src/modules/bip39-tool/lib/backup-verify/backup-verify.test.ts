import { describe, expect, it } from 'vitest';

import { createSequentialRandom } from '@/shared/infra/crypto/random.sequential';

import { pickVerificationIndices, verifyWords } from './backup-verify';

describe('backup-verify', () => {
  describe('pickVerificationIndices', () => {
    it('returns requested number of unique indices', () => {
      const indices = pickVerificationIndices(12, 3);
      expect(indices).toHaveLength(3);
      expect(new Set(indices).size).toBe(3);
      indices.forEach((index) => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(12);
      });
    });

    it('returns sorted indices', () => {
      const indices = pickVerificationIndices(24, 5);
      const sorted = [...indices].sort((a, b) => a - b);
      expect(indices).toEqual(sorted);
    });

    it('caps count at wordCount', () => {
      const indices = pickVerificationIndices(2, 5);
      expect(indices).toHaveLength(2);
    });

    it('produces deterministic indices with injected RNG', () => {
      const random = createSequentialRandom([0, 1, 2]);
      const indices = pickVerificationIndices(12, 3, random);
      expect(indices).toEqual([0, 2, 4]);
    });
  });

  describe('verifyWords', () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    it('returns true when all answers match', () => {
      const result = verifyWords(mnemonic, {
        0: 'abandon',
        5: 'abandon',
        11: 'about',
      });
      expect(result).toBe(true);
    });

    it('is case insensitive', () => {
      const result = verifyWords(mnemonic, {
        0: 'ABANDON',
        11: 'About',
      });
      expect(result).toBe(true);
    });

    it('returns false for wrong word', () => {
      const result = verifyWords(mnemonic, {
        0: 'abandon',
        11: 'wrong',
      });
      expect(result).toBe(false);
    });

    it('returns false for out-of-range index', () => {
      const result = verifyWords(mnemonic, {
        99: 'abandon',
      });
      expect(result).toBe(false);
    });
  });
});
