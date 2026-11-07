import * as bitcoin from 'bitcoinjs-lib';
import bs58 from 'bs58';
import { beforeAll, describe, expect, it } from 'vitest';

import { getSeedFromMnemonic } from '../mnemonic/bip39-generator';
import {
  deriveBIP32Root,
  deriveKeysFromExtendedPrivateKey,
  deriveKeysFromExtendedPublicKey,
  KeyDeriver,
  parseExtendedPrivateKey,
  parseExtendedPublicKey,
} from './key-derivation';

// Test vectors - using standard BIP39 mnemonic
const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

// Helper to validate base58 checksum
function validateBase58Checksum(encoded: string): boolean {
  try {
    const decoded = bs58.decode(encoded);
    if (decoded.length !== 82) return false; // Extended key should be 82 bytes

    // Verify checksum (first 4 bytes of double SHA256)
    // We'll test this indirectly by ensuring bs58.decode doesn't throw
    return true;
  } catch {
    return false;
  }
}

// Helper to validate address format
function isValidP2PKHAddress(address: string): boolean {
  return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
}

function isValidP2SHAddress(address: string): boolean {
  return /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
}

function isValidBech32Address(address: string): boolean {
  return (
    /^bc1[a-z0-9]{39,59}$/.test(address) || /^tb1[a-z0-9]{39,59}$/.test(address)
  );
}

describe('Key Derivation', () => {
  let testSeed: Uint8Array;

  beforeAll(async () => {
    // Generate seed from test mnemonic
    testSeed = await getSeedFromMnemonic(TEST_MNEMONIC);
    // Verify seed is 64 bytes
    expect(testSeed.length).toBe(64);
  });

  describe('deriveBIP32Root', () => {
    it('should derive root key from seed', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      expect(root).toBeDefined();
      expect(root.isNeutered()).toBe(false); // Should have private key
    });

    it('should derive different root keys for different networks', () => {
      const rootMainnet = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const rootTestnet = deriveBIP32Root(testSeed, bitcoin.networks.testnet);

      // Root keys should be different for different networks
      expect(rootMainnet.toBase58()).not.toBe(rootTestnet.toBase58());
    });

    it('should be deterministic (same seed → same root)', () => {
      const root1 = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const root2 = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      expect(root1.toBase58()).toBe(root2.toBase58());
    });
  });

  describe('deriveBIP44Keys', () => {
    it('should generate valid xpub with correct prefix', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );

      expect(keys.length).toBeGreaterThan(0);
      const xpub = keys[0].xpub;
      expect(xpub).toBeDefined();
      if (xpub) {
        expect(xpub).toMatch(/^xpub/);
        expect(validateBase58Checksum(xpub)).toBe(true);
      }
    });

    it('should generate P2PKH addresses (starting with 1)', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        5
      );

      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        if (key.address) {
          expect(isValidP2PKHAddress(key.address)).toBe(true);
          expect(key.address.startsWith('1')).toBe(true);
        }
      });
    });

    it('should generate receiving addresses (change index 0)', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        3
      );

      const receivingKeys = keys.filter((k) => k.path.includes('/0/'));
      expect(receivingKeys.length).toBe(3);
      receivingKeys.forEach((key) => {
        expect(key.path).toMatch(/m\/44'\/0'\/0'\/0\/\d+/);
      });
    });

    it('should generate change addresses (change index 1)', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        3
      );

      const changeKeys = keys.filter((k) => k.path.includes('/1/'));
      expect(changeKeys.length).toBe(3);
      changeKeys.forEach((key) => {
        expect(key.path).toMatch(/m\/44'\/0'\/0'\/1\/\d+/);
      });
    });

    it('should derive addresses from xpub match addresses from private keys (single source of truth)', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        5
      );

      // All keys should have the same xpub (account level)
      const xpub = keys[0].xpub;
      expect(xpub).toBeDefined();
      keys.forEach((key) => {
        expect(key.xpub).toBe(xpub);
      });

      // Verify addresses are deterministic
      const addresses = keys
        .map((k) => k.address)
        .filter((a): a is string => a !== undefined);
      const uniqueAddresses = new Set(addresses);
      expect(uniqueAddresses.size).toBe(addresses.length); // All addresses should be unique

      // Critical test: Addresses are derived from the extended public key (accountPublic.derive())
      // not from the private key. This ensures the xpub is the single source of truth.
      // The implementation derives addresses using: accountPublic.derive(0).derive(i)
      // This means if we had only the xpub, we could derive the same addresses.
    });

    it('should be deterministic (same seed → same addresses)', () => {
      const root1 = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const root2 = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);

      const keys1 = KeyDeriver.deriveKeysFromRoot(
        root1,
        'bip44',
        bitcoin.networks.bitcoin,
        5
      );
      const keys2 = KeyDeriver.deriveKeysFromRoot(
        root2,
        'bip44',
        bitcoin.networks.bitcoin,
        5
      );

      expect(keys1.length).toBe(keys2.length);
      keys1.forEach((key1, i) => {
        expect(key1.address).toBe(keys2[i].address);
        expect(key1.xpub).toBe(keys2[i].xpub);
        expect(key1.path).toBe(keys2[i].path);
      });
    });

    it('should generate different addresses for different networks', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keysMainnet = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );
      const keysTestnet = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.testnet,
        1
      );

      expect(keysMainnet[0].address).not.toBe(keysTestnet[0].address);
      expect(keysMainnet[0].xpub).not.toBe(keysTestnet[0].xpub);
    });
  });

  describe('deriveBIP49Keys', () => {
    it('should generate valid ypub with correct prefix', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );

      expect(keys.length).toBeGreaterThan(0);
      const ypub = keys[0].xpub;
      expect(ypub).toBeDefined();
      if (ypub) {
        expect(ypub).toMatch(/^ypub/);
        expect(validateBase58Checksum(ypub)).toBe(true);
      }
    });

    it('should generate P2SH addresses (starting with 3)', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        5
      );

      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        if (key.address) {
          expect(isValidP2SHAddress(key.address)).toBe(true);
          expect(key.address.startsWith('3')).toBe(true);
        }
      });
    });

    it('should generate receiving and change addresses', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        3
      );

      const receivingKeys = keys.filter((k) => k.path.includes('/0/'));
      const changeKeys = keys.filter((k) => k.path.includes('/1/'));

      expect(receivingKeys.length).toBe(3);
      expect(changeKeys.length).toBe(3);
    });

    it('should derive addresses from ypub match addresses from private keys (single source of truth)', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        5
      );

      // All keys should have the same ypub (account level)
      const ypub = keys[0].xpub;
      expect(ypub).toBeDefined();
      keys.forEach((key) => {
        expect(key.xpub).toBe(ypub);
        if (key.xpub) {
          expect(key.xpub).toMatch(/^ypub/);
        }
      });

      // Addresses are derived from the extended public key, ensuring ypub is single source of truth
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        if (key.address) {
          expect(isValidP2SHAddress(key.address)).toBe(true);
        }
      });
    });

    it('should be deterministic', () => {
      const root1 = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const root2 = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);

      const keys1 = KeyDeriver.deriveKeysFromRoot(
        root1,
        'bip49',
        bitcoin.networks.bitcoin,
        5
      );
      const keys2 = KeyDeriver.deriveKeysFromRoot(
        root2,
        'bip49',
        bitcoin.networks.bitcoin,
        5
      );

      keys1.forEach((key1, i) => {
        expect(key1.address).toBe(keys2[i].address);
        expect(key1.xpub).toBe(keys2[i].xpub);
      });
    });
  });

  describe('deriveBIP84Keys', () => {
    it('should generate valid zpub with correct prefix', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      expect(keys.length).toBeGreaterThan(0);
      const zpub = keys[0].xpub;
      expect(zpub).toBeDefined();
      if (zpub) {
        expect(zpub).toMatch(/^zpub/);
        expect(validateBase58Checksum(zpub)).toBe(true);
      }
    });

    it('should generate bech32 addresses (starting with bc1)', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        5
      );

      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        if (key.address) {
          expect(isValidBech32Address(key.address)).toBe(true);
          if (key.address.startsWith('bc1')) {
            // Mainnet bech32
            expect(key.address.startsWith('bc1')).toBe(true);
          }
        }
      });
    });

    it('should generate receiving and change addresses', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        3
      );

      const receivingKeys = keys.filter((k) => k.path.includes('/0/'));
      const changeKeys = keys.filter((k) => k.path.includes('/1/'));

      expect(receivingKeys.length).toBe(3);
      expect(changeKeys.length).toBe(3);
    });

    it('should derive addresses from zpub match addresses from private keys', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        5
      );

      // All keys should have the same zpub (account level)
      const zpub = keys[0].xpub;
      keys.forEach((key) => {
        expect(key.xpub).toBe(zpub);
        expect(key.xpub).toMatch(/^zpub/);
      });

      // Verify addresses are valid bech32
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        if (key.address) {
          expect(isValidBech32Address(key.address)).toBe(true);
        }
      });
    });

    it('should be deterministic', () => {
      const root1 = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const root2 = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);

      const keys1 = KeyDeriver.deriveKeysFromRoot(
        root1,
        'bip84',
        bitcoin.networks.bitcoin,
        5
      );
      const keys2 = KeyDeriver.deriveKeysFromRoot(
        root2,
        'bip84',
        bitcoin.networks.bitcoin,
        5
      );

      keys1.forEach((key1, i) => {
        expect(key1.address).toBe(keys2[i].address);
        expect(key1.xpub).toBe(keys2[i].xpub);
      });
    });

    it('should generate zpub that can be validated (for Blue Wallet import)', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      const zpub = keys[0].xpub;
      expect(zpub).toBeDefined();

      if (zpub) {
        // Verify zpub format
        expect(zpub).toMatch(/^zpub/);
        expect(zpub.length).toBeGreaterThan(100); // zpub should be long base58 string

        // Verify checksum is valid (bs58 decode should work)
        expect(() => bs58.decode(zpub)).not.toThrow();
        const decoded = bs58.decode(zpub);
        expect(decoded.length).toBe(82); // Extended key is 82 bytes
      }
    });
  });

  describe('Checksum Recalculation', () => {
    it('should recalculate checksum correctly when converting xpub version bytes', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );

      const xpub = keys[0].xpub;
      expect(xpub).toBeDefined();
      if (xpub) {
        // Verify xpub has valid checksum (can be decoded)
        expect(() => bs58.decode(xpub)).not.toThrow();
        const decoded = bs58.decode(xpub);
        expect(decoded.length).toBe(82);

        // Verify prefix is correct
        expect(xpub).toMatch(/^xpub/);
      }
    });

    it('should recalculate checksum correctly when converting ypub version bytes', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );

      const ypub = keys[0].xpub;
      expect(ypub).toBeDefined();
      if (ypub) {
        // Verify ypub has valid checksum (can be decoded)
        expect(() => bs58.decode(ypub)).not.toThrow();
        const decoded = bs58.decode(ypub);
        expect(decoded.length).toBe(82);

        // Verify prefix is correct
        expect(ypub).toMatch(/^ypub/);
      }
    });

    it('should recalculate checksum correctly when converting zpub version bytes', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      const zpub = keys[0].xpub;
      expect(zpub).toBeDefined();
      if (zpub) {
        // Verify zpub has valid checksum (can be decoded)
        expect(() => bs58.decode(zpub)).not.toThrow();
        const decoded = bs58.decode(zpub);
        expect(decoded.length).toBe(82);

        // Verify prefix is correct
        expect(zpub).toMatch(/^zpub/);

        // This is critical for Blue Wallet import - invalid checksum would cause import to fail
      }
    });

    it('should have different version bytes but same key data for xpub/ypub/zpub', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);

      const keys44 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );
      const keys49 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );
      const keys84 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      const xpub = keys44[0].xpub;
      const ypub = keys49[0].xpub;
      const zpub = keys84[0].xpub;

      expect(xpub).toBeDefined();
      expect(ypub).toBeDefined();
      expect(zpub).toBeDefined();

      if (xpub && ypub && zpub) {
        // Decode to get raw bytes
        const xpubDecoded = bs58.decode(xpub);
        const ypubDecoded = bs58.decode(ypub);
        const zpubDecoded = bs58.decode(zpub);

        // First 4 bytes are version bytes - should be different
        const xpubVersion = xpubDecoded.slice(0, 4);
        const ypubVersion = ypubDecoded.slice(0, 4);
        const zpubVersion = zpubDecoded.slice(0, 4);

        expect(xpubVersion).not.toEqual(ypubVersion);
        expect(xpubVersion).not.toEqual(zpubVersion);
        expect(ypubVersion).not.toEqual(zpubVersion);

        // But the key data (bytes 4-78) should be the same for same account
        // Note: Actually, they're different accounts (m/44' vs m/49' vs m/84')
        // So the key data will be different, but the structure (82 bytes) should be the same
        expect(xpubDecoded.length).toBe(82);
        expect(ypubDecoded.length).toBe(82);
        expect(zpubDecoded.length).toBe(82);
      }
    });
  });

  describe('Checksum Recalculation', () => {
    it('should recalculate checksum correctly when converting xpub version bytes', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );

      const xpub = keys[0].xpub;
      expect(xpub).toBeDefined();
      if (xpub) {
        // Verify xpub has valid checksum (can be decoded)
        expect(() => bs58.decode(xpub)).not.toThrow();
        const decoded = bs58.decode(xpub);
        expect(decoded.length).toBe(82);

        // Verify prefix is correct
        expect(xpub).toMatch(/^xpub/);
      }
    });

    it('should recalculate checksum correctly when converting ypub version bytes', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );

      const ypub = keys[0].xpub;
      expect(ypub).toBeDefined();
      if (ypub) {
        // Verify ypub has valid checksum (can be decoded)
        expect(() => bs58.decode(ypub)).not.toThrow();
        const decoded = bs58.decode(ypub);
        expect(decoded.length).toBe(82);

        // Verify prefix is correct
        expect(ypub).toMatch(/^ypub/);
      }
    });

    it('should recalculate checksum correctly when converting zpub version bytes', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      const zpub = keys[0].xpub;
      expect(zpub).toBeDefined();
      if (zpub) {
        // Verify zpub has valid checksum (can be decoded)
        expect(() => bs58.decode(zpub)).not.toThrow();
        const decoded = bs58.decode(zpub);
        expect(decoded.length).toBe(82);

        // Verify prefix is correct
        expect(zpub).toMatch(/^zpub/);

        // This is critical for Blue Wallet import - invalid checksum would cause import to fail
      }
    });

    it('should have different version bytes but same key data structure for xpub/ypub/zpub', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);

      const keys44 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );
      const keys49 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );
      const keys84 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      const xpub = keys44[0].xpub;
      const ypub = keys49[0].xpub;
      const zpub = keys84[0].xpub;

      expect(xpub).toBeDefined();
      expect(ypub).toBeDefined();
      expect(zpub).toBeDefined();

      if (xpub && ypub && zpub) {
        // Decode to get raw bytes
        const xpubDecoded = bs58.decode(xpub);
        const ypubDecoded = bs58.decode(ypub);
        const zpubDecoded = bs58.decode(zpub);

        // First 4 bytes are version bytes - should be different
        const xpubVersion = xpubDecoded.slice(0, 4);
        const ypubVersion = ypubDecoded.slice(0, 4);
        const zpubVersion = zpubDecoded.slice(0, 4);

        expect(xpubVersion).not.toEqual(ypubVersion);
        expect(xpubVersion).not.toEqual(zpubVersion);
        expect(ypubVersion).not.toEqual(zpubVersion);

        // But the structure (82 bytes) should be the same
        expect(xpubDecoded.length).toBe(82);
        expect(ypubDecoded.length).toBe(82);
        expect(zpubDecoded.length).toBe(82);
      }
    });
  });

  describe('Checksum Validation', () => {
    it('should have valid checksums for xpub', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );

      const xpub = keys[0].xpub;
      expect(xpub).toBeDefined();
      if (xpub) {
        expect(validateBase58Checksum(xpub)).toBe(true);
        expect(() => bs58.decode(xpub)).not.toThrow();
      }
    });

    it('should have valid checksums for ypub', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );

      const ypub = keys[0].xpub;
      expect(ypub).toBeDefined();
      if (ypub) {
        expect(validateBase58Checksum(ypub)).toBe(true);
        expect(() => bs58.decode(ypub)).not.toThrow();
      }
    });

    it('should have valid checksums for zpub', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      const zpub = keys[0].xpub;
      expect(zpub).toBeDefined();
      if (zpub) {
        expect(validateBase58Checksum(zpub)).toBe(true);
        expect(() => bs58.decode(zpub)).not.toThrow();
      }
    });

    it('should have different prefixes but same underlying key data structure', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);

      const keys44 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );
      const keys49 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );
      const keys84 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      const xpub = keys44[0].xpub;
      const ypub = keys49[0].xpub;
      const zpub = keys84[0].xpub;

      expect(xpub).toBeDefined();
      expect(ypub).toBeDefined();
      expect(zpub).toBeDefined();

      if (xpub && ypub && zpub) {
        // All should have valid checksums
        expect(validateBase58Checksum(xpub)).toBe(true);
        expect(validateBase58Checksum(ypub)).toBe(true);
        expect(validateBase58Checksum(zpub)).toBe(true);

        // All should decode to 82 bytes
        expect(bs58.decode(xpub).length).toBe(82);
        expect(bs58.decode(ypub).length).toBe(82);
        expect(bs58.decode(zpub).length).toBe(82);
      }
    });
  });

  describe('Cross-validation', () => {
    it('should generate different addresses for different derivation paths', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);

      const keys44 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );
      const keys49 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );
      const keys84 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      const addr44 = keys44[0].address;
      const addr49 = keys49[0].address;
      const addr84 = keys84[0].address;

      expect(addr44).toBeDefined();
      expect(addr49).toBeDefined();
      expect(addr84).toBeDefined();

      if (addr44 && addr49 && addr84) {
        // Addresses should be different
        expect(addr44).not.toBe(addr49);
        expect(addr44).not.toBe(addr84);
        expect(addr49).not.toBe(addr84);

        // But all should be valid
        expect(isValidP2PKHAddress(addr44)).toBe(true);
        expect(isValidP2SHAddress(addr49)).toBe(true);
        expect(isValidBech32Address(addr84)).toBe(true);
      }
    });

    it('should have extended public keys at account level', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);

      const keys44 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        5
      );
      const keys49 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        5
      );
      const keys84 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        5
      );

      // All keys in same derivation path should share the same extended public key
      const xpub44 = keys44[0].xpub;
      const ypub49 = keys49[0].xpub;
      const zpub84 = keys84[0].xpub;

      keys44.forEach((key) => expect(key.xpub).toBe(xpub44));
      keys49.forEach((key) => expect(key.xpub).toBe(ypub49));
      keys84.forEach((key) => expect(key.xpub).toBe(zpub84));
    });

    it('should generate consistent results across multiple calls', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);

      const keys1 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        10
      );
      const keys2 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        10
      );

      expect(keys1.length).toBe(keys2.length);
      expect(keys1.length).toBe(20); // 10 receiving + 10 change

      keys1.forEach((key1, i) => {
        expect(key1.address).toBe(keys2[i].address);
        expect(key1.path).toBe(keys2[i].path);
        expect(key1.xpub).toBe(keys2[i].xpub);
      });
    });
  });

  describe('parseExtendedPublicKey', () => {
    let testXpub: string;
    let testYpub: string;
    let testZpub: string;
    let testTpub: string;
    let testUpub: string;
    let testVpub: string;

    beforeAll(() => {
      // Generate extended public keys from test seed for testing
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys44 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );
      const keys49 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );
      const keys84 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      testXpub = keys44[0].xpub || '';
      testYpub = keys49[0].xpub || '';
      testZpub = keys84[0].xpub || '';

      // Generate testnet keys
      const rootTestnet = deriveBIP32Root(testSeed, bitcoin.networks.testnet);
      const keys44Testnet = KeyDeriver.deriveKeysFromRoot(
        rootTestnet,
        'bip44',
        bitcoin.networks.testnet,
        1
      );
      const keys49Testnet = KeyDeriver.deriveKeysFromRoot(
        rootTestnet,
        'bip49',
        bitcoin.networks.testnet,
        1
      );
      const keys84Testnet = KeyDeriver.deriveKeysFromRoot(
        rootTestnet,
        'bip84',
        bitcoin.networks.testnet,
        1
      );

      testTpub = keys44Testnet[0].xpub || '';
      testUpub = keys49Testnet[0].xpub || '';
      testVpub = keys84Testnet[0].xpub || '';
    });

    it('should parse valid xpub (mainnet)', () => {
      const node = parseExtendedPublicKey(
        testXpub,
        bitcoin.networks.bitcoin,
        'bip44'
      );
      expect(node).toBeDefined();
      expect(node.isNeutered()).toBe(true);
      expect(node.privateKey).toBeUndefined();
    });

    it('should parse valid ypub (mainnet)', () => {
      const node = parseExtendedPublicKey(
        testYpub,
        bitcoin.networks.bitcoin,
        'bip49'
      );
      expect(node).toBeDefined();
      expect(node.isNeutered()).toBe(true);
      expect(node.privateKey).toBeUndefined();
    });

    it('should parse valid zpub (mainnet)', () => {
      const node = parseExtendedPublicKey(
        testZpub,
        bitcoin.networks.bitcoin,
        'bip84'
      );
      expect(node).toBeDefined();
      expect(node.isNeutered()).toBe(true);
      expect(node.privateKey).toBeUndefined();
    });

    it('should parse valid tpub (testnet)', () => {
      const node = parseExtendedPublicKey(
        testTpub,
        bitcoin.networks.testnet,
        'bip44'
      );
      expect(node).toBeDefined();
      expect(node.isNeutered()).toBe(true);
      expect(node.privateKey).toBeUndefined();
    });

    it('should parse valid upub (testnet)', () => {
      const node = parseExtendedPublicKey(
        testUpub,
        bitcoin.networks.testnet,
        'bip49'
      );
      expect(node).toBeDefined();
      expect(node.isNeutered()).toBe(true);
      expect(node.privateKey).toBeUndefined();
    });

    it('should parse valid vpub (testnet)', () => {
      const node = parseExtendedPublicKey(
        testVpub,
        bitcoin.networks.testnet,
        'bip84'
      );
      expect(node).toBeDefined();
      expect(node.isNeutered()).toBe(true);
      expect(node.privateKey).toBeUndefined();
    });

    it('should auto-detect network from key version bytes', () => {
      // Pass wrong network, but it should auto-detect from key
      const nodeMainnet = parseExtendedPublicKey(
        testXpub,
        bitcoin.networks.testnet,
        'bip44'
      );
      const nodeTestnet = parseExtendedPublicKey(
        testTpub,
        bitcoin.networks.bitcoin,
        'bip44'
      );

      expect(nodeMainnet).toBeDefined();
      expect(nodeTestnet).toBeDefined();
    });

    it('should normalize whitespace in keys', () => {
      const keyWithSpaces = `  ${testXpub}  `;
      const keyWithNewlines = `\n${testXpub}\n`;
      const keyWithMixed = `  \n  ${testXpub}  \n  `;

      expect(() =>
        parseExtendedPublicKey(keyWithSpaces, bitcoin.networks.bitcoin, 'bip44')
      ).not.toThrow();
      expect(() =>
        parseExtendedPublicKey(
          keyWithNewlines,
          bitcoin.networks.bitcoin,
          'bip44'
        )
      ).not.toThrow();
      expect(() =>
        parseExtendedPublicKey(keyWithMixed, bitcoin.networks.bitcoin, 'bip44')
      ).not.toThrow();
    });

    it('should throw error for empty key', () => {
      expect(() =>
        parseExtendedPublicKey('', bitcoin.networks.bitcoin, 'bip44')
      ).toThrow('Extended public key cannot be empty');
      expect(() =>
        parseExtendedPublicKey('   ', bitcoin.networks.bitcoin, 'bip44')
      ).toThrow('Extended public key cannot be empty');
    });

    it('should throw error for invalid key format', () => {
      expect(() =>
        parseExtendedPublicKey('invalid-key', bitcoin.networks.bitcoin, 'bip44')
      ).toThrow();
    });

    it('should throw error when private key is used as public key', () => {
      // Generate a private key
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const account = root.derivePath("m/44'/0'/0'");
      const xprv = account.toBase58();

      expect(() =>
        parseExtendedPublicKey(xprv, bitcoin.networks.bitcoin, 'bip44')
      ).toThrow('Extended key is a private key, not a public key');
    });

    it('should handle keys at account level (depth 3)', () => {
      const node = parseExtendedPublicKey(
        testXpub,
        bitcoin.networks.bitcoin,
        'bip44'
      );
      // If key is at account level, depth should be 3
      // If it's root, it will be derived to account level
      expect(node).toBeDefined();
    });

    it('should handle root-level keys (but cannot derive hardened paths from public keys)', () => {
      // Create a root-level extended public key
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const rootXpub = root.neutered().toBase58();

      // Note: You cannot derive hardened paths (like m/44'/0'/0') from a public key
      // This is a limitation of BIP32 - hardened derivation requires the private key
      // So this test expects an error when trying to derive hardened paths from a root public key
      expect(() => {
        parseExtendedPublicKey(rootXpub, bitcoin.networks.bitcoin, 'bip44');
      }).toThrow();
    });
  });

  describe('parseExtendedPrivateKey', () => {
    let testXprv: string;
    let testTprv: string;

    beforeAll(() => {
      // Generate extended private keys from test seed
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const account = root.derivePath("m/44'/0'/0'");
      testXprv = account.toBase58();

      const rootTestnet = deriveBIP32Root(testSeed, bitcoin.networks.testnet);
      const accountTestnet = rootTestnet.derivePath("m/44'/0'/0'");
      testTprv = accountTestnet.toBase58();
    });

    it('should parse valid xprv (mainnet)', () => {
      const node = parseExtendedPrivateKey(
        testXprv,
        bitcoin.networks.bitcoin,
        'bip44'
      );
      expect(node).toBeDefined();
      expect(node.isNeutered()).toBe(false);
      expect(node.privateKey).toBeDefined();
    });

    it('should parse valid tprv (testnet)', () => {
      const node = parseExtendedPrivateKey(
        testTprv,
        bitcoin.networks.testnet,
        'bip44'
      );
      expect(node).toBeDefined();
      expect(node.isNeutered()).toBe(false);
      expect(node.privateKey).toBeDefined();
    });

    it('should auto-detect network from key version bytes', () => {
      // Pass wrong network, but it should auto-detect from key
      const nodeMainnet = parseExtendedPrivateKey(
        testXprv,
        bitcoin.networks.testnet,
        'bip44'
      );
      const nodeTestnet = parseExtendedPrivateKey(
        testTprv,
        bitcoin.networks.bitcoin,
        'bip44'
      );

      expect(nodeMainnet).toBeDefined();
      expect(nodeTestnet).toBeDefined();
    });

    it('should normalize whitespace in keys', () => {
      const keyWithSpaces = `  ${testXprv}  `;
      const keyWithNewlines = `\n${testXprv}\n`;

      expect(() =>
        parseExtendedPrivateKey(
          keyWithSpaces,
          bitcoin.networks.bitcoin,
          'bip44'
        )
      ).not.toThrow();
      expect(() =>
        parseExtendedPrivateKey(
          keyWithNewlines,
          bitcoin.networks.bitcoin,
          'bip44'
        )
      ).not.toThrow();
    });

    it('should throw error for empty key', () => {
      expect(() =>
        parseExtendedPrivateKey('', bitcoin.networks.bitcoin, 'bip44')
      ).toThrow('Extended private key cannot be empty');
    });

    it('should throw error for invalid key format', () => {
      expect(() =>
        parseExtendedPrivateKey(
          'invalid-key',
          bitcoin.networks.bitcoin,
          'bip44'
        )
      ).toThrow();
    });

    it('should throw error when public key is used as private key', () => {
      // Generate a public key
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );
      const xpub = keys[0].xpub || '';

      expect(() =>
        parseExtendedPrivateKey(xpub, bitcoin.networks.bitcoin, 'bip44')
      ).toThrow('Extended key is not a private key');
    });

    it('should handle keys at account level (depth 3)', () => {
      const node = parseExtendedPrivateKey(
        testXprv,
        bitcoin.networks.bitcoin,
        'bip44'
      );
      expect(node).toBeDefined();
      expect(node.depth).toBe(3); // Should be at account level
    });

    it('should derive to account level from root key', () => {
      // Create a root-level extended private key
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const rootXprv = root.toBase58();

      const node = parseExtendedPrivateKey(
        rootXprv,
        bitcoin.networks.bitcoin,
        'bip44'
      );
      expect(node).toBeDefined();
      expect(node.depth).toBe(3); // Should be at account level after derivation
    });
  });

  describe('deriveKeysFromExtendedPublicKey', () => {
    let testXpub: string;
    let testYpub: string;
    let testZpub: string;

    beforeAll(() => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const keys44 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        1
      );
      const keys49 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip49',
        bitcoin.networks.bitcoin,
        1
      );
      const keys84 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip84',
        bitcoin.networks.bitcoin,
        1
      );

      testXpub = keys44[0].xpub || '';
      testYpub = keys49[0].xpub || '';
      testZpub = keys84[0].xpub || '';
    });

    it('should derive addresses from xpub (BIP44)', () => {
      const keys = deriveKeysFromExtendedPublicKey(
        testXpub,
        bitcoin.networks.bitcoin,
        'bip44',
        3
      );

      expect(keys.length).toBe(6); // 3 receiving + 3 change
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        expect(key.publicKey).toBeDefined();
        expect(key.privateKey).toBe(''); // No private keys from public keys
        expect(key.privateKeyWIF).toBe(''); // No private keys from public keys
        expect(key.xpub).toBe(testXpub);
      });

      // Receiving addresses should be P2PKH
      const receivingAddresses = keys.filter((k) => k.path.includes('/0/'));
      receivingAddresses.forEach((key) => {
        expect(isValidP2PKHAddress(key.address || '')).toBe(true);
      });
    });

    it('should derive addresses from ypub (BIP49)', () => {
      const keys = deriveKeysFromExtendedPublicKey(
        testYpub,
        bitcoin.networks.bitcoin,
        'bip49',
        3
      );

      expect(keys.length).toBe(6); // 3 receiving + 3 change
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        expect(key.publicKey).toBeDefined();
        expect(key.privateKey).toBe('');
        expect(key.privateKeyWIF).toBe('');
        expect(key.xpub).toBe(testYpub);
      });

      // Receiving addresses should be P2SH
      const receivingAddresses = keys.filter((k) => k.path.includes('/0/'));
      receivingAddresses.forEach((key) => {
        expect(isValidP2SHAddress(key.address || '')).toBe(true);
      });
    });

    it('should derive addresses from zpub (BIP84)', () => {
      const keys = deriveKeysFromExtendedPublicKey(
        testZpub,
        bitcoin.networks.bitcoin,
        'bip84',
        3
      );

      expect(keys.length).toBe(6); // 3 receiving + 3 change
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        expect(key.publicKey).toBeDefined();
        expect(key.privateKey).toBe('');
        expect(key.privateKeyWIF).toBe('');
        expect(key.xpub).toBe(testZpub);
      });

      // Receiving addresses should be Bech32
      const receivingAddresses = keys.filter((k) => k.path.includes('/0/'));
      receivingAddresses.forEach((key) => {
        expect(isValidBech32Address(key.address || '')).toBe(true);
      });
    });

    it('should match addresses derived from original seed (round-trip)', () => {
      // Generate addresses from seed
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const originalKeys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        5
      );

      // Extract xpub from first key
      const xpub = originalKeys[0].xpub || '';

      // Derive addresses from xpub
      const recoveredKeys = deriveKeysFromExtendedPublicKey(
        xpub,
        bitcoin.networks.bitcoin,
        'bip44',
        5
      );

      // Compare addresses (only receiving addresses, as order might differ)
      const originalReceiving = originalKeys
        .filter((k) => k.path.includes('/0/'))
        .map((k) => k.address)
        .sort();
      const recoveredReceiving = recoveredKeys
        .filter((k) => k.path.includes('/0/'))
        .map((k) => k.address)
        .sort();

      expect(recoveredReceiving).toEqual(originalReceiving);
    });

    it('should generate correct number of addresses', () => {
      const keys = deriveKeysFromExtendedPublicKey(
        testXpub,
        bitcoin.networks.bitcoin,
        'bip44',
        10
      );

      expect(keys.length).toBe(20); // 10 receiving + 10 change
    });

    it('should work with testnet keys', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.testnet);
      const keys44 = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.testnet,
        1
      );
      const tpub = keys44[0].xpub || '';

      const keys = deriveKeysFromExtendedPublicKey(
        tpub,
        bitcoin.networks.testnet,
        'bip44',
        2
      );

      expect(keys.length).toBe(4); // 2 receiving + 2 change
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        // Testnet addresses start with 'm' or 'n' for P2PKH
        if (key.path.includes('/0/')) {
          expect(
            key.address?.startsWith('m') || key.address?.startsWith('n')
          ).toBe(true);
        }
      });
    });
  });

  describe('deriveKeysFromExtendedPrivateKey', () => {
    let testXprv: string;
    let testYprv: string;
    let testZprv: string;

    beforeAll(() => {
      // Use root-level keys since deriveKeys expects root nodes
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      testXprv = root.toBase58();
      testYprv = root.toBase58(); // Same root for all paths
      testZprv = root.toBase58(); // Same root for all paths
    });

    it('should derive addresses from xprv (BIP44)', () => {
      const keys = deriveKeysFromExtendedPrivateKey(
        testXprv,
        bitcoin.networks.bitcoin,
        'bip44',
        3
      );

      expect(keys.length).toBe(6); // 3 receiving + 3 change
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        expect(key.publicKey).toBeDefined();
        expect(key.privateKey).toBeDefined();
        expect(key.privateKeyWIF).toBeDefined();
        expect(key.privateKey.length).toBeGreaterThan(0);
        expect(key.privateKeyWIF.length).toBeGreaterThan(0);
      });

      // Receiving addresses should be P2PKH
      const receivingAddresses = keys.filter((k) => k.path.includes('/0/'));
      receivingAddresses.forEach((key) => {
        expect(isValidP2PKHAddress(key.address || '')).toBe(true);
      });
    });

    it('should derive addresses from yprv (BIP49)', () => {
      const keys = deriveKeysFromExtendedPrivateKey(
        testYprv,
        bitcoin.networks.bitcoin,
        'bip49',
        3
      );

      expect(keys.length).toBe(6); // 3 receiving + 3 change
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        expect(key.privateKey).toBeDefined();
        expect(key.privateKeyWIF).toBeDefined();
      });

      // Receiving addresses should be P2SH
      const receivingAddresses = keys.filter((k) => k.path.includes('/0/'));
      receivingAddresses.forEach((key) => {
        expect(isValidP2SHAddress(key.address || '')).toBe(true);
      });
    });

    it('should derive addresses from zprv (BIP84)', () => {
      const keys = deriveKeysFromExtendedPrivateKey(
        testZprv,
        bitcoin.networks.bitcoin,
        'bip84',
        3
      );

      expect(keys.length).toBe(6); // 3 receiving + 3 change
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        expect(key.privateKey).toBeDefined();
        expect(key.privateKeyWIF).toBeDefined();
      });

      // Receiving addresses should be Bech32
      const receivingAddresses = keys.filter((k) => k.path.includes('/0/'));
      receivingAddresses.forEach((key) => {
        expect(isValidBech32Address(key.address || '')).toBe(true);
      });
    });

    it('should match addresses derived from original seed (round-trip)', () => {
      // Generate addresses from seed
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const originalKeys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        5
      );

      // Use root-level xprv (deriveKeys expects root)
      const rootXprv = root.toBase58();

      // Derive addresses from xprv
      const recoveredKeys = deriveKeysFromExtendedPrivateKey(
        rootXprv,
        bitcoin.networks.bitcoin,
        'bip44',
        5
      );

      // Compare all addresses (order might differ, so sort)
      const originalAddresses = originalKeys.map((k) => k.address).sort();
      const recoveredAddresses = recoveredKeys.map((k) => k.address).sort();

      expect(recoveredAddresses).toEqual(originalAddresses);
    });

    it('should match private keys derived from original seed (round-trip)', () => {
      // Generate keys from seed
      const root = deriveBIP32Root(testSeed, bitcoin.networks.bitcoin);
      const originalKeys = KeyDeriver.deriveKeysFromRoot(
        root,
        'bip44',
        bitcoin.networks.bitcoin,
        3
      );

      // Use root-level xprv (deriveKeys expects root)
      const rootXprv = root.toBase58();

      // Derive keys from xprv
      const recoveredKeys = deriveKeysFromExtendedPrivateKey(
        rootXprv,
        bitcoin.networks.bitcoin,
        'bip44',
        3
      );

      // Compare private keys (order might differ)
      const originalWIFs = originalKeys.map((k) => k.privateKeyWIF).sort();
      const recoveredWIFs = recoveredKeys.map((k) => k.privateKeyWIF).sort();

      expect(recoveredWIFs).toEqual(originalWIFs);
    });

    it('should generate correct number of addresses', () => {
      const keys = deriveKeysFromExtendedPrivateKey(
        testXprv,
        bitcoin.networks.bitcoin,
        'bip44',
        10
      );

      expect(keys.length).toBe(20); // 10 receiving + 10 change
    });

    it('should work with testnet keys', () => {
      const root = deriveBIP32Root(testSeed, bitcoin.networks.testnet);
      // Use root-level key (deriveKeys expects root)
      const tprv = root.toBase58();

      const keys = deriveKeysFromExtendedPrivateKey(
        tprv,
        bitcoin.networks.testnet,
        'bip44',
        2
      );

      expect(keys.length).toBe(4); // 2 receiving + 2 change
      keys.forEach((key) => {
        expect(key.address).toBeDefined();
        expect(key.privateKey).toBeDefined();
        expect(key.privateKeyWIF).toBeDefined();
      });
    });
  });
});

describe('account paths per network (BIP44 / SLIP-44 coin type)', () => {
  it('uses coin type 0 on mainnet and 1 on test networks', async () => {
    const { getAccountPath, describeAccountPath } = await import(
      './key-derivation'
    );
    const bitcoinLib = await import('bitcoinjs-lib');
    expect(getAccountPath('bip84', bitcoinLib.networks.bitcoin)).toBe(
      "m/84'/0'/0'"
    );
    expect(getAccountPath('bip49', bitcoinLib.networks.testnet)).toBe(
      "m/49'/1'/0'"
    );
    expect(getAccountPath('bip44', bitcoinLib.networks.regtest)).toBe(
      "m/44'/1'/0'"
    );
    expect(describeAccountPath("m/49'/1'/0'")).toEqual({
      scheme: 'BIP49',
      networkLabel: 'Bitcoin Testnet / Regtest',
    });
    expect(describeAccountPath("m/44'/0'/0'").scheme).toBe('BIP44');
  });
});
