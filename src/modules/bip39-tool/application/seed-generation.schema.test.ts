import { describe, expect, it } from 'vitest';

import { seedGenerationSchema } from './seed-generation.schema';

const base = { generationMode: 'random', wordCount: 12, passphrase: '' };

describe('seedGenerationSchema', () => {
  it('accepts random mode without entropy', () => {
    expect(seedGenerationSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an unsupported word count', () => {
    expect(
      seedGenerationSchema.safeParse({ ...base, wordCount: 13 }).success
    ).toBe(false);
  });

  it('requires entropy in custom mode', () => {
    const result = seedGenerationSchema.safeParse({
      ...base,
      generationMode: 'custom',
      customEntropy: '   ',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['customEntropy']);
  });

  it('rejects custom entropy shorter than the word count needs', () => {
    const result = seedGenerationSchema.safeParse({
      ...base,
      generationMode: 'custom',
      customEntropy: 'ab'.repeat(15), // 15 bytes < 16 needed for 12 words
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-hex custom entropy', () => {
    const result = seedGenerationSchema.safeParse({
      ...base,
      generationMode: 'custom',
      customEntropy: 'zz'.repeat(16),
    });
    expect(result.success).toBe(false);
  });

  it('accepts exact-length custom entropy for every word count', () => {
    const bytesFor = { 12: 16, 15: 20, 18: 24, 21: 28, 24: 32 } as const;
    for (const [words, bytes] of Object.entries(bytesFor)) {
      const result = seedGenerationSchema.safeParse({
        ...base,
        wordCount: Number(words),
        generationMode: 'custom',
        customEntropy: '7f'.repeat(bytes),
      });
      expect(result.success).toBe(true);
    }
  });
});
