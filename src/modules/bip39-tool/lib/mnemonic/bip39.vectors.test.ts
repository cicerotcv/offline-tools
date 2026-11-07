import * as bitcoin from 'bitcoinjs-lib';
import { describe, expect, it } from 'vitest';

import type { WordCount } from '../../domain/bitcoin/config';
import {
  BIP32_VECTOR_1,
  BIP39_PASSPHRASE,
  BIP39_VECTORS,
  BIP49_TESTNET_VECTOR,
  BIP84_VECTOR,
} from '../../domain/vectors/official-vectors';
import { deriveBIP32Root, deriveKeys } from '../derivation/key-derivation';
import {
  bytesToHex,
  generateMnemonicFromEntropy,
  getEntropyFromMnemonic,
  getSeedFromMnemonic,
  validateMnemonic,
} from './bip39-generator';

const hexToBytes = (hex: string) =>
  new Uint8Array(hex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));

const wordCountOf = (mnemonic: string) =>
  mnemonic.split(' ').length as WordCount;

describe('BIP39 official vectors (trezor/python-mnemonic)', () => {
  it.each(BIP39_VECTORS.map((v) => [v.entropy, v]))(
    'entropy %s',
    async (_label, vector) => {
      const entropy = hexToBytes(vector.entropy);

      const mnemonic = await generateMnemonicFromEntropy(
        entropy,
        wordCountOf(vector.mnemonic)
      );
      expect(mnemonic).toBe(vector.mnemonic);
      expect(validateMnemonic(vector.mnemonic)).toBe(true);
      expect(bytesToHex(getEntropyFromMnemonic(vector.mnemonic))).toBe(
        vector.entropy
      );

      const seed = await getSeedFromMnemonic(vector.mnemonic, BIP39_PASSPHRASE);
      expect(bytesToHex(seed)).toBe(vector.seed);
      expect(deriveBIP32Root(seed, bitcoin.networks.bitcoin).toBase58()).toBe(
        vector.rootXprv
      );
    }
  );
});

describe('BIP32 test vector 1', () => {
  const root = deriveBIP32Root(
    hexToBytes(BIP32_VECTOR_1.seed),
    bitcoin.networks.bitcoin
  );

  it.each(BIP32_VECTOR_1.chains.map((c) => [c.path, c]))(
    'chain %s',
    (_label, chain) => {
      const node = chain.path === 'm' ? root : root.derivePath(chain.path);
      expect(node.toBase58()).toBe(chain.xprv);
      expect(node.neutered().toBase58()).toBe(chain.xpub);
    }
  );
});

describe('BIP84 official vector (native segwit)', () => {
  it('derives the published account zpub and receiving keys', async () => {
    const seed = await getSeedFromMnemonic(BIP84_VECTOR.mnemonic);
    const root = deriveBIP32Root(seed, bitcoin.networks.bitcoin);
    const keys = deriveKeys(
      root,
      bitcoin.networks.bitcoin,
      'bip84',
      BIP84_VECTOR.receive.length
    );

    BIP84_VECTOR.receive.forEach((expected, index) => {
      expect(keys[index].path).toBe(expected.path);
      expect(keys[index].address).toBe(expected.address);
      expect(keys[index].publicKey).toBe(expected.publicKey);
      expect(keys[index].privateKeyWIF).toBe(expected.wif);
    });
    expect(keys[0].xpub).toBe(BIP84_VECTOR.accountXpub);
  });
});

describe('BIP49 official vector (nested segwit, testnet)', () => {
  it('derives the published account upub and first receiving key', async () => {
    const seed = await getSeedFromMnemonic(BIP49_TESTNET_VECTOR.mnemonic);
    const root = deriveBIP32Root(seed, bitcoin.networks.testnet);
    const [key] = deriveKeys(root, bitcoin.networks.testnet, 'bip49', 1);
    const expected = BIP49_TESTNET_VECTOR.receive0;

    expect(key.path).toBe(expected.path);
    expect(key.address).toBe(expected.address);
    expect(key.publicKey).toBe(expected.publicKey);
    expect(key.privateKeyWIF).toBe(expected.wif);
    expect(key.xpub).toBe(BIP49_TESTNET_VECTOR.accountXpub);
  });
});

describe('BIP44 cross-check (legacy)', () => {
  // BIP44 publishes no vectors; this is the widely reproduced first address
  // for the "abandon ... about" mnemonic (Electrum, Ian Coleman BIP39 tool).
  it('derives the well-known first receiving address', async () => {
    const seed = await getSeedFromMnemonic(BIP84_VECTOR.mnemonic);
    const root = deriveBIP32Root(seed, bitcoin.networks.bitcoin);
    const [key] = deriveKeys(root, bitcoin.networks.bitcoin, 'bip44', 1);

    expect(key.path).toBe("m/44'/0'/0'/0/0");
    expect(key.address).toBe('1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA');
  });
});
