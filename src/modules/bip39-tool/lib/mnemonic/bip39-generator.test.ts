import { describe, expect, it } from 'vitest';

import { webCryptoDigest } from '@/shared/infra/crypto/digest.web-crypto';
import { createSequentialRandom } from '@/shared/infra/crypto/random.sequential';

import {
  generateMnemonicFromEntropy,
  generateMnemonicFromRandomWithExtraEntropy,
  getEntropyFromMnemonic,
  getSeedFromMnemonic,
  parseHexEntropy,
  validateEntropyLength,
} from './bip39-generator';

// BIP39 Test Vectors (from BIP39 specification)
const TEST_VECTORS = {
  // Test vector 1: All zeros
  entropy1: '00000000000000000000000000000000',
  mnemonic1:
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',

  // Test vector 2: All ones
  entropy2: 'ffffffffffffffffffffffffffffffff',
  mnemonic2: 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong',

  // Test vector 3: With passphrase
  mnemonic3:
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  passphrase3: 'TREZOR',
} as const;

describe('BIP39 Generator', () => {
  describe('generateMnemonicFromRandomWithExtraEntropy', () => {
    it('generates valid mnemonic without extra entropy', async () => {
      const mnemonic = await generateMnemonicFromRandomWithExtraEntropy(12);
      expect(mnemonic.split(' ').length).toBe(12);
    });

    it('generates valid mnemonic with extra entropy', async () => {
      const extra = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const mnemonic = await generateMnemonicFromRandomWithExtraEntropy(
        12,
        extra
      );
      expect(mnemonic.split(' ').length).toBe(12);
    });

    it('produces different mnemonics with different extra entropy', async () => {
      const m1 = await generateMnemonicFromRandomWithExtraEntropy(
        12,
        new Uint8Array([1, 2, 3])
      );
      const m2 = await generateMnemonicFromRandomWithExtraEntropy(
        12,
        new Uint8Array([4, 5, 6])
      );
      expect(m1).not.toBe(m2);
    });

    it('produces deterministic mnemonic with injected RNG (no extra entropy)', async () => {
      const random = createSequentialRandom(Array(16).fill(0));
      const mnemonic = await generateMnemonicFromRandomWithExtraEntropy(
        12,
        undefined,
        { random, digest: webCryptoDigest }
      );
      expect(mnemonic).toBe(TEST_VECTORS.mnemonic1);
    });
  });

  describe('generateMnemonicFromEntropy', () => {
    it('should generate correct mnemonic from known entropy (12 words)', async () => {
      const entropy = parseHexEntropy(TEST_VECTORS.entropy1);
      const mnemonic = await generateMnemonicFromEntropy(entropy, 12);
      expect(mnemonic).toBe(TEST_VECTORS.mnemonic1);
    });

    it('should generate correct mnemonic from known entropy (test vector 2)', async () => {
      const entropy = parseHexEntropy(TEST_VECTORS.entropy2);
      const mnemonic = await generateMnemonicFromEntropy(entropy, 12);
      expect(mnemonic).toBe(TEST_VECTORS.mnemonic2);
    });

    it('should be deterministic (same entropy → same mnemonic)', async () => {
      const entropy = parseHexEntropy(
        'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
      );
      const mnemonic1 = await generateMnemonicFromEntropy(entropy, 24);
      const mnemonic2 = await generateMnemonicFromEntropy(entropy, 24);
      expect(mnemonic1).toBe(mnemonic2);
    });

    it('should handle exact entropy length (16 bytes for 12 words)', async () => {
      const entropy = new Uint8Array(16).fill(0x42);
      const mnemonic = await generateMnemonicFromEntropy(entropy, 12);
      expect(mnemonic.split(' ').length).toBe(12);
    });

    it('should handle exact entropy length (20 bytes for 15 words)', async () => {
      const entropy = new Uint8Array(20).fill(0x42);
      const mnemonic = await generateMnemonicFromEntropy(entropy, 15);
      expect(mnemonic.split(' ').length).toBe(15);
    });

    it('should handle exact entropy length (24 bytes for 18 words)', async () => {
      const entropy = new Uint8Array(24).fill(0x42);
      const mnemonic = await generateMnemonicFromEntropy(entropy, 18);
      expect(mnemonic.split(' ').length).toBe(18);
    });

    it('should handle exact entropy length (28 bytes for 21 words)', async () => {
      const entropy = new Uint8Array(28).fill(0x42);
      const mnemonic = await generateMnemonicFromEntropy(entropy, 21);
      expect(mnemonic.split(' ').length).toBe(21);
    });

    it('should handle exact entropy length (32 bytes for 24 words)', async () => {
      const entropy = new Uint8Array(32).fill(0x42);
      const mnemonic = await generateMnemonicFromEntropy(entropy, 24);
      expect(mnemonic.split(' ').length).toBe(24);
    });

    it('should hash longer entropy correctly', async () => {
      // 64 bytes of entropy, should be hashed to 32 bytes for 24 words
      const longEntropy = new Uint8Array(64).fill(0x42);
      const mnemonic = await generateMnemonicFromEntropy(longEntropy, 24);
      expect(mnemonic.split(' ').length).toBe(24);

      // Should be deterministic
      const mnemonic2 = await generateMnemonicFromEntropy(longEntropy, 24);
      expect(mnemonic).toBe(mnemonic2);
    });

    it('should throw error for too short entropy', async () => {
      const shortEntropy = new Uint8Array(15); // 15 bytes, need 16 for 12 words
      await expect(
        generateMnemonicFromEntropy(shortEntropy, 12)
      ).rejects.toThrow('Invalid entropy length');
    });

    it('should throw error for too short entropy (24 words)', async () => {
      const shortEntropy = new Uint8Array(31); // 31 bytes, need 32 for 24 words
      await expect(
        generateMnemonicFromEntropy(shortEntropy, 24)
      ).rejects.toThrow('Invalid entropy length');
    });
  });

  describe('getSeedFromMnemonic', () => {
    it('should generate correct seed from known mnemonic (no passphrase)', async () => {
      const seed = await getSeedFromMnemonic(TEST_VECTORS.mnemonic1);
      // Verify seed is 64 bytes
      expect(seed.length).toBe(64);
      // Verify seed is deterministic
      const seed2 = await getSeedFromMnemonic(TEST_VECTORS.mnemonic1);
      expect(seed).toEqual(seed2);
    });

    it('should generate seed with passphrase', async () => {
      const seedWithPassphrase = await getSeedFromMnemonic(
        TEST_VECTORS.mnemonic3,
        TEST_VECTORS.passphrase3
      );
      // Seed with passphrase should be different from seed without
      const seedWithoutPassphrase = await getSeedFromMnemonic(
        TEST_VECTORS.mnemonic3
      );
      expect(seedWithPassphrase).not.toEqual(seedWithoutPassphrase);
      // Seed with passphrase should still be 64 bytes
      expect(seedWithPassphrase.length).toBe(64);
    });

    it('should generate seed without passphrase (empty string)', async () => {
      const seed1 = await getSeedFromMnemonic(TEST_VECTORS.mnemonic1, '');
      const seed2 = await getSeedFromMnemonic(TEST_VECTORS.mnemonic1);
      expect(seed1).toEqual(seed2);
    });

    it('should throw error for invalid mnemonic', async () => {
      await expect(
        getSeedFromMnemonic('invalid mnemonic phrase here')
      ).rejects.toThrow('Invalid mnemonic phrase');
    });

    it('should generate 64-byte seed', async () => {
      const seed = await getSeedFromMnemonic(TEST_VECTORS.mnemonic1);
      expect(seed.length).toBe(64);
    });

    it('should be deterministic (same mnemonic + passphrase → same seed)', async () => {
      const seed1 = await getSeedFromMnemonic(TEST_VECTORS.mnemonic1, 'test');
      const seed2 = await getSeedFromMnemonic(TEST_VECTORS.mnemonic1, 'test');
      expect(seed1).toEqual(seed2);
    });
  });

  describe('getEntropyFromMnemonic', () => {
    it('should extract correct entropy from known mnemonic', () => {
      const entropy = getEntropyFromMnemonic(TEST_VECTORS.mnemonic1);
      const entropyHex = Array.from(entropy)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      expect(entropyHex).toBe(TEST_VECTORS.entropy1);
    });

    it('should throw error for invalid mnemonic', () => {
      expect(() => {
        getEntropyFromMnemonic('invalid mnemonic phrase');
      }).toThrow('Invalid mnemonic phrase');
    });

    it('should round-trip: entropy → mnemonic → entropy', async () => {
      const originalEntropy = parseHexEntropy(
        'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
      );
      const mnemonic = await generateMnemonicFromEntropy(originalEntropy, 24);
      const recoveredEntropy = getEntropyFromMnemonic(mnemonic);
      expect(recoveredEntropy).toEqual(originalEntropy);
    });
  });

  describe('parseHexEntropy', () => {
    it('should parse valid hex string', () => {
      const entropy = parseHexEntropy('a1b2c3d4');
      expect(entropy).toEqual(new Uint8Array([0xa1, 0xb2, 0xc3, 0xd4]));
    });

    it('should handle uppercase hex', () => {
      const entropy = parseHexEntropy('A1B2C3D4');
      expect(entropy).toEqual(new Uint8Array([0xa1, 0xb2, 0xc3, 0xd4]));
    });

    it('should handle mixed case hex', () => {
      const entropy = parseHexEntropy('A1b2C3d4');
      expect(entropy).toEqual(new Uint8Array([0xa1, 0xb2, 0xc3, 0xd4]));
    });

    it('should remove whitespace', () => {
      const entropy1 = parseHexEntropy('a1b2c3d4');
      const entropy2 = parseHexEntropy('a1 b2 c3 d4');
      const entropy3 = parseHexEntropy('  a1b2c3d4  ');
      expect(entropy1).toEqual(entropy2);
      expect(entropy1).toEqual(entropy3);
    });

    it('should throw error for invalid hex characters', () => {
      expect(() => {
        parseHexEntropy('g1h2i3j4');
      }).toThrow('Invalid hex string');
    });

    it('should throw error for non-hex characters', () => {
      expect(() => {
        parseHexEntropy('hello world');
      }).toThrow('Invalid hex string');
    });

    it('should throw error for empty string', () => {
      expect(() => {
        parseHexEntropy('');
      }).toThrow('Invalid hex string');
    });
  });

  describe('validateEntropyLength', () => {
    it('should validate minimum length for 12 words', () => {
      const validEntropy = new Uint8Array(16);
      const invalidEntropy = new Uint8Array(15);
      expect(validateEntropyLength(validEntropy, 12)).toBe(true);
      expect(validateEntropyLength(invalidEntropy, 12)).toBe(false);
    });

    it('should validate minimum length for 24 words', () => {
      const validEntropy = new Uint8Array(32);
      const invalidEntropy = new Uint8Array(31);
      expect(validateEntropyLength(validEntropy, 24)).toBe(true);
      expect(validateEntropyLength(invalidEntropy, 24)).toBe(false);
    });

    it('should accept longer entropy (more is better)', () => {
      const longEntropy = new Uint8Array(64);
      expect(validateEntropyLength(longEntropy, 12)).toBe(true);
      expect(validateEntropyLength(longEntropy, 24)).toBe(true);
    });

    it('should validate all word counts', () => {
      const entropies = {
        12: new Uint8Array(16),
        15: new Uint8Array(20),
        18: new Uint8Array(24),
        21: new Uint8Array(28),
        24: new Uint8Array(32),
      };

      for (const [wordCount, entropy] of Object.entries(entropies)) {
        expect(
          validateEntropyLength(
            entropy,
            Number(wordCount) as 12 | 15 | 18 | 21 | 24
          )
        ).toBe(true);
      }
    });
  });
});
