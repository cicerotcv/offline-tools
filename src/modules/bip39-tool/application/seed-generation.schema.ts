import { z } from 'zod';

import { getWordCountConfig } from '../domain/mnemonic/word-counts';
import { parseHexEntropy, validateEntropyLength } from '../lib/mnemonic';

export const seedGenerationSchema = z
  .object({
    generationMode: z.enum(['random', 'custom']),
    wordCount: z.union([
      z.literal(12),
      z.literal(15),
      z.literal(18),
      z.literal(21),
      z.literal(24),
    ]),
    customEntropy: z.string().optional(),
    passphrase: z.string(),
  })
  .refine(
    (data) => {
      // If generation mode is custom, entropy is required
      if (data.generationMode === 'custom') {
        return (
          data.customEntropy !== undefined &&
          data.customEntropy.trim().length > 0
        );
      }
      return true;
    },
    {
      message: 'Please enter entropy for custom generation mode',
      path: ['customEntropy'],
    }
  )
  .superRefine((data, ctx) => {
    // If generation mode is custom, validate entropy format and length
    if (data.generationMode === 'custom' && data.customEntropy) {
      try {
        const parsedEntropy = parseHexEntropy(data.customEntropy.trim());
        if (!validateEntropyLength(parsedEntropy, data.wordCount)) {
          const config = getWordCountConfig(data.wordCount);
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid entropy length. Need at least ${config.entropyHexLength} hex characters (${config.entropyBits} bits).`,
            path: ['customEntropy'],
          });
        }
      } catch (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            err instanceof Error
              ? err.message
              : 'Invalid entropy format. Must be a valid hexadecimal string.',
          path: ['customEntropy'],
        });
      }
    }
  });

export type SeedGenerationFormData = z.infer<typeof seedGenerationSchema>;
