import type { WordCount } from '../bitcoin/config';

export interface WordCountConfig {
  wordCount: WordCount;
  entropyBits: number;
  checksumBits: number;
  entropyBytes: number;
  entropyHexLength: number; // Length of hex string
}

export const WORD_COUNT_CONFIGS: Record<WordCount, WordCountConfig> = {
  12: {
    wordCount: 12,
    entropyBits: 128,
    checksumBits: 4,
    entropyBytes: 16,
    entropyHexLength: 32, // 16 bytes * 2 hex chars
  },
  15: {
    wordCount: 15,
    entropyBits: 160,
    checksumBits: 5,
    entropyBytes: 20,
    entropyHexLength: 40, // 20 bytes * 2 hex chars
  },
  18: {
    wordCount: 18,
    entropyBits: 192,
    checksumBits: 6,
    entropyBytes: 24,
    entropyHexLength: 48, // 24 bytes * 2 hex chars
  },
  21: {
    wordCount: 21,
    entropyBits: 224,
    checksumBits: 7,
    entropyBytes: 28,
    entropyHexLength: 56, // 28 bytes * 2 hex chars
  },
  24: {
    wordCount: 24,
    entropyBits: 256,
    checksumBits: 8,
    entropyBytes: 32,
    entropyHexLength: 64, // 32 bytes * 2 hex chars
  },
};

export const VALID_WORD_COUNTS: WordCount[] = [12, 15, 18, 21, 24];

export function getWordCountConfig(wordCount: WordCount): WordCountConfig {
  return WORD_COUNT_CONFIGS[wordCount];
}
