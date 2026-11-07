import * as bitcoin from 'bitcoinjs-lib';
import { describe, expect, it } from 'vitest';

import { createSequentialRandom } from '@/shared/infra/crypto/random.sequential';

import { generatePaperWallet } from './paper-wallet';

const SEQUENTIAL_SEED_BYTES = Array.from({ length: 64 }, (_, i) => i);

describe('paper-wallet', () => {
  it('generates deterministic wallet with injected RNG', async () => {
    const random = createSequentialRandom(SEQUENTIAL_SEED_BYTES);
    const wallet = await generatePaperWallet(
      {
        network: bitcoin.networks.bitcoin,
        addressType: 'native',
        passphrase: '',
      },
      { random }
    );

    expect(wallet.network).toBe('mainnet');
    expect(wallet.path).toBe("m/84'/0'/0'/0/0");
    expect(wallet.address).toMatch(/^bc1/);
    expect(wallet.privateKeyWIF).toMatch(/^L/);
    expect(wallet.encryptedPrivateKey).toBeNull();
    expect(wallet.seedHex).toBe(
      SEQUENTIAL_SEED_BYTES.map((b) => b.toString(16).padStart(2, '0')).join('')
    );

    const wallet2 = await generatePaperWallet(
      {
        network: bitcoin.networks.bitcoin,
        addressType: 'native',
        passphrase: '',
      },
      { random: createSequentialRandom(SEQUENTIAL_SEED_BYTES) }
    );
    expect(wallet2).toEqual(wallet);
  });

  it('derives legacy address type on testnet', async () => {
    const random = createSequentialRandom(SEQUENTIAL_SEED_BYTES);
    const wallet = await generatePaperWallet(
      {
        network: bitcoin.networks.testnet,
        addressType: 'legacy',
        passphrase: '',
      },
      { random }
    );

    expect(wallet.network).toBe('testnet');
    expect(wallet.path).toBe("m/44'/1'/0'/0/0");
    expect(wallet.address).toMatch(/^[mn2]/);
  });

  it('encrypts private key when passphrase is provided', async () => {
    const random = createSequentialRandom(SEQUENTIAL_SEED_BYTES);
    const wallet = await generatePaperWallet(
      {
        network: bitcoin.networks.bitcoin,
        addressType: 'native',
        passphrase: 'test-passphrase',
      },
      { random }
    );

    expect(wallet.encryptedPrivateKey).toBeTruthy();
    expect(wallet.encryptedPrivateKey).toMatch(/^6P/);
    // BIP38 runs scrypt on purpose; slower still under coverage.
  }, 30_000);
});
