import { describe, expect, it } from 'vitest';

import { webCryptoAead } from '@/shared/infra/crypto/aead.web-crypto';

import { SHAMIR_V2_VECTOR } from '../domain/vectors/v2-vectors';
import { ReconstructSecretUseCase } from './reconstruct-secret.use-case';

const reconstruct = (lines: readonly string[]) =>
  new ReconstructSecretUseCase(webCryptoAead).execute({
    shareText: lines.join('\n'),
  });

/** Every combination of `size` items, in order. */
function combinations<T>(items: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  return items.flatMap((item, i) =>
    combinations(items.slice(i + 1), size - 1).map((rest) => [item, ...rest])
  );
}

describe('frozen v2 shares (copies people keep offline)', () => {
  const { shares, threshold, secret } = SHAMIR_V2_VECTOR;

  it('any M of them recover the secret, flagged as legacy', async () => {
    for (const subset of combinations(shares, threshold)) {
      expect(await reconstruct(subset)).toMatchObject({
        kind: 'valid',
        secret,
        legacy: true,
      });
    }
  });

  it('M-1 of them never count as valid', async () => {
    for (const subset of combinations(shares, threshold - 1)) {
      expect((await reconstruct(subset)).kind).toBe('opaque');
    }
  });
});
