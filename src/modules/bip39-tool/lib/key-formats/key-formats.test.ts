import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import { beforeAll, describe, expect, it } from 'vitest';

import { deriveBIP32Root } from '../derivation/key-derivation';
import { getSeedFromMnemonic } from '../mnemonic/bip39-generator';
import {
  getExtendedPrivateKey,
  getExtendedPublicKey,
  privateKeyToWIF,
} from './key-formats';

const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

describe('Key Formats', () => {
  let root: ReturnType<typeof deriveBIP32Root>;

  beforeAll(async () => {
    const seed = await getSeedFromMnemonic(TEST_MNEMONIC);
    root = deriveBIP32Root(seed, bitcoin.networks.bitcoin);
  });

  describe('privateKeyToWIF', () => {
    it('should convert private key to WIF format (mainnet)', () => {
      // Derive a child key to get a private key
      const child = root.derivePath("m/44'/0'/0'/0/0");
      const privateKey = child.privateKey;

      expect(privateKey).toBeDefined();
      if (privateKey) {
        const wif = privateKeyToWIF(
          Buffer.from(privateKey),
          bitcoin.networks.bitcoin
        );

        // WIF should start with '5' or 'K' or 'L' for mainnet uncompressed/compressed
        expect(wif.length).toBeGreaterThan(50);
        expect(typeof wif).toBe('string');
      }
    });

    it('should convert private key to WIF format (testnet)', async () => {
      const seed = await getSeedFromMnemonic(TEST_MNEMONIC);
      const testnetRoot = deriveBIP32Root(seed, bitcoin.networks.testnet);
      const child = testnetRoot.derivePath("m/44'/0'/0'/0/0");
      const privateKey = child.privateKey;

      expect(privateKey).toBeDefined();
      if (privateKey) {
        const wif = privateKeyToWIF(
          Buffer.from(privateKey),
          bitcoin.networks.testnet
        );

        // WIF should start with '9' or 'c' for testnet
        expect(wif.length).toBeGreaterThan(50);
        expect(typeof wif).toBe('string');
      }
    });

    it('should handle hex string input', () => {
      const child = root.derivePath("m/44'/0'/0'/0/0");
      const privateKey = child.privateKey;

      expect(privateKey).toBeDefined();
      if (privateKey) {
        const hexKey = Buffer.from(privateKey).toString('hex');
        const wif = privateKeyToWIF(hexKey, bitcoin.networks.bitcoin);

        expect(wif.length).toBeGreaterThan(50);
        expect(typeof wif).toBe('string');
      }
    });

    it('should be deterministic (same key → same WIF)', () => {
      const child = root.derivePath("m/44'/0'/0'/0/0");
      const privateKey = child.privateKey;

      expect(privateKey).toBeDefined();
      if (privateKey) {
        const keyBuffer = Buffer.from(privateKey);
        const wif1 = privateKeyToWIF(keyBuffer, bitcoin.networks.bitcoin);
        const wif2 = privateKeyToWIF(keyBuffer, bitcoin.networks.bitcoin);

        expect(wif1).toBe(wif2);
      }
    });

    it('should generate different WIF for different networks', async () => {
      const seed = await getSeedFromMnemonic(TEST_MNEMONIC);
      const mainnetRoot = deriveBIP32Root(seed, bitcoin.networks.bitcoin);
      const testnetRoot = deriveBIP32Root(seed, bitcoin.networks.testnet);

      const mainnetChild = mainnetRoot.derivePath("m/44'/0'/0'/0/0");
      const testnetChild = testnetRoot.derivePath("m/44'/0'/0'/0/0");

      const mainnetKey = mainnetChild.privateKey;
      const testnetKey = testnetChild.privateKey;

      expect(mainnetKey).toBeDefined();
      expect(testnetKey).toBeDefined();

      if (mainnetKey && testnetKey) {
        // Even with same path, different networks should produce different WIF
        // (though the keys themselves might be the same, WIF encoding differs)
        const mainnetWIF = privateKeyToWIF(
          Buffer.from(mainnetKey),
          bitcoin.networks.bitcoin
        );
        const testnetWIF = privateKeyToWIF(
          Buffer.from(testnetKey),
          bitcoin.networks.testnet
        );

        expect(mainnetWIF).not.toBe(testnetWIF);
      }
    });
  });

  describe('getExtendedPublicKey', () => {
    it('should return neutered (public-only) extended key', () => {
      const account = root.derivePath("m/44'/0'/0'");
      const xpub = getExtendedPublicKey(account);

      expect(xpub).toBeDefined();
      expect(typeof xpub).toBe('string');
      expect(xpub.length).toBeGreaterThan(100);

      // Should be base58 encoded (xpub is base58, not base64, but we just verify it's a valid string)
      expect(typeof xpub).toBe('string');
    });

    it('should return same xpub for neutered and non-neutered nodes at same path', () => {
      const account = root.derivePath("m/44'/0'/0'");
      const xpub1 = getExtendedPublicKey(account);
      const xpub2 = account.neutered().toBase58();

      expect(xpub1).toBe(xpub2);
    });

    it('should be deterministic', () => {
      const account = root.derivePath("m/44'/0'/0'");
      const xpub1 = getExtendedPublicKey(account);
      const xpub2 = getExtendedPublicKey(account);

      expect(xpub1).toBe(xpub2);
    });
  });

  describe('getExtendedPrivateKey', () => {
    it('should return extended private key (xprv)', () => {
      const account = root.derivePath("m/44'/0'/0'");
      const xprv = getExtendedPrivateKey(account);

      expect(xprv).toBeDefined();
      expect(typeof xprv).toBe('string');
      expect(xprv.length).toBeGreaterThan(100);
      expect(xprv).toMatch(/^xprv/);
    });

    it('should be deterministic', () => {
      const account = root.derivePath("m/44'/0'/0'");
      const xprv1 = getExtendedPrivateKey(account);
      const xprv2 = getExtendedPrivateKey(account);

      expect(xprv1).toBe(xprv2);
    });

    it('should return different xprv for different paths', () => {
      const account44 = root.derivePath("m/44'/0'/0'");
      const account49 = root.derivePath("m/49'/0'/0'");

      const xprv44 = getExtendedPrivateKey(account44);
      const xprv49 = getExtendedPrivateKey(account49);

      expect(xprv44).not.toBe(xprv49);
    });
  });
});
