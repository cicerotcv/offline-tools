import * as bitcoin from 'bitcoinjs-lib';
import { describe, expect, it } from 'vitest';

import { webCryptoDigest } from '@/shared/infra/crypto/digest.web-crypto';
import { createSequentialRandom } from '@/shared/infra/crypto/random.sequential';

import { validateMnemonic } from '../lib/mnemonic';
import { CreatePaperWalletUseCase } from './create-paper-wallet.use-case';
import { GenerateMnemonicUseCase } from './generate-mnemonic.use-case';
import { MnemonicFromEntropyUseCase } from './mnemonic-from-entropy.use-case';
import { PickVerificationWordsUseCase } from './pick-verification-words.use-case';

describe('bip39 use cases', () => {
  it('generates a valid mnemonic from the injected random source', async () => {
    const random = () => createSequentialRandom([0]);
    const a = await new GenerateMnemonicUseCase(
      random(),
      webCryptoDigest
    ).execute({ wordCount: 12 });
    expect(a).toBe(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    );
    const mixed = await new GenerateMnemonicUseCase(
      random(),
      webCryptoDigest
    ).execute({ wordCount: 24, extraEntropy: new Uint8Array([1, 2, 3]) });
    expect(validateMnemonic(mixed)).toBe(true);
    expect(mixed.split(' ')).toHaveLength(24);
  });

  it('derives the official vector mnemonic from exact entropy', async () => {
    const mnemonic = await new MnemonicFromEntropyUseCase(
      webCryptoDigest
    ).execute({ entropy: new Uint8Array(16).fill(0x7f), wordCount: 12 });
    expect(mnemonic).toBe(
      'legal winner thank year wave sausage worth useful legal winner thank yellow'
    );
  });

  it('creates a paper wallet deterministically for a fixed random source', async () => {
    const run = () =>
      new CreatePaperWalletUseCase(createSequentialRandom([5, 6, 7])).execute({
        network: bitcoin.networks.bitcoin,
        addressType: 'native',
        passphrase: '',
      });
    const [a, b] = await Promise.all([run(), run()]);
    expect(a.address).toBe(b.address);
    expect(a.address).toMatch(/^bc1q/);
  });

  it('verifies the BIP38 key decrypts to the printed address', async () => {
    const wallet = await new CreatePaperWalletUseCase(
      createSequentialRandom([11, 22, 33])
    ).execute({
      network: bitcoin.networks.bitcoin,
      addressType: 'segwit',
      passphrase: 'paper wallet passphrase',
    });
    expect(wallet.encryptedPrivateKey).toMatch(/^6P/);
    expect(wallet.address).toMatch(/^3/);
  }, 120_000);

  it('picks distinct in-range verification positions', () => {
    const indices = new PickVerificationWordsUseCase(
      createSequentialRandom([9, 200, 3, 77, 41])
    ).execute({ wordCount: 12, count: 3 });
    expect(new Set(indices).size).toBe(3);
    indices.forEach((i) => expect(i).toBeGreaterThanOrEqual(0));
    indices.forEach((i) => expect(i).toBeLessThan(12));
  });
});
