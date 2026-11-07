import type { WordCount } from '../../domain/bitcoin/config';
import { VALID_WORD_COUNTS } from '../../domain/mnemonic/word-counts';
import { getWordIndex } from '../wordlist';
import { validateMnemonic } from './bip39-generator';

/*
 * Word-by-word analysis of a typed phrase: which words are not in the
 * wordlist, whether the length is a BIP39 length, and the checksum once the
 * phrase is complete. Shared by Seed Validation and Tiny Seed.
 */

export type WordCountStatus = 'empty' | 'invalid-length' | 'valid-length';
export type ChecksumStatus = 'valid' | 'invalid' | null;

export interface MnemonicAnalysis {
  words: string[];
  indexes: (number | null)[];
  invalidWords: string[];
  wordCount: number;
  wordCountStatus: WordCountStatus;
  checksumStatus: ChecksumStatus;
  mnemonic: string;
}

export function parseMnemonicInput(input: string): string[] {
  if (!input.trim()) {
    return [];
  }

  return input
    .trim()
    .split(/\s+/)
    .map((word) => word.toLowerCase().trim())
    .filter((word) => word.length > 0);
}

export function analyzeMnemonicWords(inputWords: string[]): MnemonicAnalysis {
  if (inputWords.length === 0) {
    return {
      words: [],
      indexes: [],
      invalidWords: [],
      wordCount: 0,
      wordCountStatus: 'empty',
      checksumStatus: null,
      mnemonic: '',
    };
  }

  const invalidWords: string[] = [];
  const indexes: (number | null)[] = [];

  for (const word of inputWords) {
    const index = getWordIndex(word);
    if (index === -1) {
      indexes.push(null);
      if (!invalidWords.includes(word)) {
        invalidWords.push(word);
      }
    } else {
      indexes.push(index);
    }
  }

  const wordCount = inputWords.length;
  const isValidLength = VALID_WORD_COUNTS.includes(wordCount as WordCount);
  const wordCountStatus: WordCountStatus = isValidLength
    ? 'valid-length'
    : 'invalid-length';
  const mnemonic = inputWords.join(' ');

  let checksumStatus: ChecksumStatus = null;
  if (invalidWords.length === 0 && isValidLength) {
    checksumStatus = validateMnemonic(mnemonic) ? 'valid' : 'invalid';
  }

  return {
    words: inputWords,
    indexes,
    invalidWords,
    wordCount,
    wordCountStatus,
    checksumStatus,
    mnemonic,
  };
}
