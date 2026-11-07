import { describe, expect, it } from 'vitest';

import { isValidPlaintext, reconstructSecret, splitSecret } from './shamir';

describe('Shamir Secret Sharing (encrypt-then-Shamir)', () => {
  describe('splitSecret', () => {
    it('should split a secret into N shares with threshold M', () => {
      const secret = new TextEncoder().encode('Hello, World!');
      const shares = splitSecret(secret, 5, 3);

      expect(shares).toHaveLength(5);
      shares.forEach((share) => {
        expect(share.x).toBeGreaterThanOrEqual(1);
        expect(share.x).toBeLessThanOrEqual(5);
        expect(share.y).toHaveLength(32);
        expect(share.nonce).toHaveLength(12);
        expect(share.ciphertext.length).toBeGreaterThan(0);
      });
    });

    it('should embed identical nonce and ciphertext in all shares', () => {
      const secret = new TextEncoder().encode('Test');
      const shares = splitSecret(secret, 5, 3);

      for (let i = 1; i < shares.length; i++) {
        expect(shares[i].nonce).toEqual(shares[0].nonce);
        expect(shares[i].ciphertext).toEqual(shares[0].ciphertext);
      }
    });

    it('should generate unique x values for each share', () => {
      const secret = new TextEncoder().encode('Test');
      const shares = splitSecret(secret, 5, 3);

      const xValues = shares.map((s) => s.x);
      expect(new Set(xValues).size).toBe(5);
      expect(xValues).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty secret', () => {
      const secret = new Uint8Array(0);
      const shares = splitSecret(secret, 5, 3);

      expect(shares).toHaveLength(5);
      const result = reconstructSecret(shares.slice(0, 3));
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.secret).toEqual(secret);
      }
    });

    it('should throw when M > N', () => {
      const secret = new TextEncoder().encode('Test');
      expect(() => splitSecret(secret, 3, 5)).toThrow(
        'Threshold (M) cannot be greater than total shares (N)'
      );
    });

    it('should throw when M < 2', () => {
      const secret = new TextEncoder().encode('Test');
      expect(() => splitSecret(secret, 5, 1)).toThrow(
        'Threshold (M) must be at least 2'
      );
    });

    it('should throw when N > 255', () => {
      const secret = new TextEncoder().encode('Test');
      expect(() => splitSecret(secret, 256, 3)).toThrow(
        'Total shares (N) cannot exceed 255'
      );
    });
  });

  describe('reconstructSecret', () => {
    it('should reconstruct with exactly M shares', () => {
      const secret = new TextEncoder().encode('Hello, World!');
      const shares = splitSecret(secret, 5, 3);
      const result = reconstructSecret(shares.slice(0, 3));

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.secret).toEqual(secret);
      }
    });

    it('should reconstruct with more than M shares', () => {
      const secret = new TextEncoder().encode('Test');
      const shares = splitSecret(secret, 5, 3);
      const result = reconstructSecret(shares);

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.secret).toEqual(secret);
      }
    });

    it('should produce illegible output with fewer than M shares', () => {
      const secret = new TextEncoder().encode('My secret password');
      const shares = splitSecret(secret, 5, 3);

      for (const count of [1, 2]) {
        const result = reconstructSecret(shares.slice(0, count));
        expect(result.isValid).toBe(false);
        if (!result.isValid) {
          expect(isValidPlaintext(result.opaque)).toBe(false);
          expect(result.opaque).not.toEqual(secret);
        }
      }
    });

    it('should produce illegible output with tampered share', () => {
      const secret = new TextEncoder().encode('Sensitive data');
      const shares = splitSecret(secret, 5, 3);
      const tampered = shares.map((s) => ({ ...s, y: new Uint8Array(s.y) }));
      tampered[0].y[0] ^= 0xff;

      const result = reconstructSecret(tampered.slice(0, 3));
      expect(result.isValid).toBe(false);
    });

    it('should throw when shares are from different splits', () => {
      const secret = new TextEncoder().encode('Test');
      const shares1 = splitSecret(secret, 5, 3);
      const shares2 = splitSecret(secret, 5, 3);

      const mixed = [shares1[0], shares1[1], shares2[2]];
      expect(() => reconstructSecret(mixed)).toThrow('nonce mismatch');
    });

    it('should work with different share order', () => {
      const secret = new TextEncoder().encode('Test');
      const shares = splitSecret(secret, 5, 3);
      const shuffled = [shares[2], shares[0], shares[4]];
      const result = reconstructSecret(shuffled);

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.secret).toEqual(secret);
      }
    });

    it('should throw on empty shares', () => {
      expect(() => reconstructSecret([])).toThrow(
        'At least one share is required'
      );
    });

    it('should throw on duplicate x values', () => {
      const secret = new TextEncoder().encode('Test');
      const shares = splitSecret(secret, 5, 3);
      const duplicate = [shares[0], shares[0], shares[1]];

      expect(() => reconstructSecret(duplicate)).toThrow(
        'Duplicate x values in shares'
      );
    });

    it('should throw on nonce mismatch', () => {
      const secret = new TextEncoder().encode('Test');
      const shares1 = splitSecret(secret, 5, 3);
      const shares2 = splitSecret(secret, 5, 3);

      const mixed = [
        shares1[0],
        shares1[1],
        { ...shares1[2], nonce: shares2[2].nonce },
      ];

      expect(() => reconstructSecret(mixed)).toThrow('nonce mismatch');
    });
  });

  describe('Security properties', () => {
    it('should produce different shares for different secrets', () => {
      const shares1 = splitSecret(new TextEncoder().encode('Secret 1'), 5, 3);
      const shares2 = splitSecret(new TextEncoder().encode('Secret 2'), 5, 3);

      for (let i = 0; i < 5; i++) {
        expect(shares1[i].y).not.toEqual(shares2[i].y);
      }
    });

    it('should produce different shares for same secret (randomness)', () => {
      const secret = new TextEncoder().encode('Same Secret');
      const shares1 = splitSecret(secret, 5, 3);
      const shares2 = splitSecret(secret, 5, 3);

      const allSame = shares1.every((s1, i) =>
        s1.y.every((byte, j) => byte === shares2[i].y[j])
      );
      expect(allSame).toBe(false);
    });

    it('should fail magic byte check with insufficient shares in almost all trials', () => {
      const secret = new TextEncoder().encode('Test secret for statistics');
      let invalidCount = 0;
      const trials = 20;

      for (let t = 0; t < trials; t++) {
        const shares = splitSecret(secret, 5, 3);
        const result = reconstructSecret(shares.slice(0, 2));
        if (!result.isValid) {
          invalidCount++;
        }
      }

      expect(invalidCount).toBeGreaterThanOrEqual(trials - 1);
    });

    it('should allow reconstruction with any M shares from N', () => {
      const secret = new TextEncoder().encode('Test');
      const shares = splitSecret(secret, 10, 5);

      const combinations = [
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 9],
        [5, 6, 7, 8, 9],
        [0, 2, 4, 6, 8],
      ];

      for (const indices of combinations) {
        const subset = indices.map((i) => shares[i]);
        const result = reconstructSecret(subset);
        expect(result.isValid).toBe(true);
        if (result.isValid) {
          expect(result.secret).toEqual(secret);
        }
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle Unicode secrets', () => {
      const secret = new TextEncoder().encode('Hello 世界 🔐');
      const shares = splitSecret(secret, 5, 3);
      const result = reconstructSecret(shares.slice(0, 3));

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(new TextDecoder().decode(result.secret)).toBe('Hello 世界 🔐');
      }
    });

    it('should handle large secrets', () => {
      const secret = new Uint8Array(1000);
      for (let i = 0; i < 1000; i++) {
        secret[i] = i % 256;
      }
      const shares = splitSecret(secret, 5, 3);
      const result = reconstructSecret(shares.slice(0, 3));

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.secret).toEqual(secret);
      }
    });
  });
});
