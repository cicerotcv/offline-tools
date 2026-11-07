import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import type { WordCount } from '../../domain/bitcoin/config';
import { getWordCountConfig } from '../../domain/mnemonic/word-counts';
import {
  bytesToHex,
  generateMnemonicFromEntropy,
  getEntropyFromMnemonic,
  validateMnemonic,
} from './bip39-generator';

const WORD_COUNTS: WordCount[] = [12, 15, 18, 21, 24];

const exactEntropy = fc.constantFrom(...WORD_COUNTS).chain((wordCount) =>
  fc.record({
    wordCount: fc.constant(wordCount),
    entropy: fc.uint8Array({
      minLength: getWordCountConfig(wordCount).entropyBytes,
      maxLength: getWordCountConfig(wordCount).entropyBytes,
    }),
  })
);

describe('BIP39 mnemonic properties', () => {
  it('entropy -> mnemonic -> entropy is the identity', async () => {
    await fc.assert(
      fc.asyncProperty(exactEntropy, async ({ wordCount, entropy }) => {
        const mnemonic = await generateMnemonicFromEntropy(entropy, wordCount);
        expect(mnemonic.split(' ')).toHaveLength(wordCount);
        expect(validateMnemonic(mnemonic)).toBe(true);
        expect(bytesToHex(getEntropyFromMnemonic(mnemonic))).toBe(
          bytesToHex(entropy)
        );
      }),
      { numRuns: 200 }
    );
  });

  it('longer custom entropy still yields a valid mnemonic of the requested size', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...WORD_COUNTS),
        fc.uint8Array({ minLength: 33, maxLength: 128 }),
        async (wordCount, entropy) => {
          const mnemonic = await generateMnemonicFromEntropy(
            entropy,
            wordCount
          );
          expect(mnemonic.split(' ')).toHaveLength(wordCount);
          expect(validateMnemonic(mnemonic)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects entropy shorter than the word count requires', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...WORD_COUNTS), async (wordCount) => {
        const short = new Uint8Array(
          getWordCountConfig(wordCount).entropyBytes - 1
        );
        await expect(
          generateMnemonicFromEntropy(short, wordCount)
        ).rejects.toThrow();
      })
    );
  });

  it('rejects phrases with a word outside the wordlist', () => {
    const valid =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    expect(validateMnemonic(valid.replace(/about$/, 'satoshix'))).toBe(false);
    expect(validateMnemonic(valid.split(' ').slice(0, 11).join(' '))).toBe(
      false
    );
  });
});
