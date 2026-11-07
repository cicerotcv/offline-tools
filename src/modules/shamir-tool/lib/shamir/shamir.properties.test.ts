import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { webCryptoAead } from '@/shared/infra/crypto/aead.web-crypto';
import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';

import { reconstructSecret, type ShamirShare, splitSecret } from './shamir';
import { openSharesV3, type ShamirShareV3, splitSecretV3 } from './v3';

/** Picks `size` distinct shares, in a shuffled order chosen by fast-check. */
const subsetOf = (shares: ShamirShare[], picks: number[], size: number) => {
  const pool = [...shares];
  const subset: ShamirShare[] = [];
  for (let i = 0; i < size; i++) {
    subset.push(pool.splice(picks[i] % pool.length, 1)[0]);
  }
  return subset;
};

const splitScenario = fc
  .record({
    secret: fc.uint8Array({ minLength: 1, maxLength: 96 }),
    n: fc.integer({ min: 2, max: 12 }),
  })
  .chain(({ secret, n }) =>
    fc.record({
      secret: fc.constant(secret),
      n: fc.constant(n),
      m: fc.integer({ min: 2, max: n }),
      picks: fc.array(fc.nat(), { minLength: 12, maxLength: 12 }),
    })
  );

describe('Shamir properties', () => {
  it('any M of N shares reconstruct the exact secret', () => {
    fc.assert(
      fc.property(splitScenario, ({ secret, n, m, picks }) => {
        const shares = splitSecret(secret, n, m);
        const result = reconstructSecret(subsetOf(shares, picks, m));
        expect(result.isValid).toBe(true);
        if (result.isValid) {
          expect(Array.from(result.secret)).toEqual(Array.from(secret));
        }
      }),
      { numRuns: 300 }
    );
  });

  it('more than M shares also reconstruct the secret', () => {
    fc.assert(
      fc.property(splitScenario, ({ secret, n, m, picks }) => {
        const shares = splitSecret(secret, n, m);
        const result = reconstructSecret(subsetOf(shares, picks, n));
        expect(result.isValid && Array.from(result.secret)).toEqual(
          Array.from(secret)
        );
      }),
      { numRuns: 150 }
    );
  });

  // KNOWN LIMIT (v2 only, kept for reading old shares): validity is a single
  // magic byte (PLAINTEXT_MAGIC). With M-1 shares the reconstructed key is
  // random, so ~1/256 attempts report isValid: true with wrong bytes. 4000
  // runs make missing it ~1e-7 likely. v3 authenticates with AES-GCM (below).
  it.fails('M-1 shares are never reported as a valid secret', () => {
    fc.assert(
      fc.property(splitScenario, ({ secret, n, m, picks }) => {
        const shares = splitSecret(secret, n, m);
        const result = reconstructSecret(subsetOf(shares, picks, m - 1));
        expect(result.isValid).toBe(false);
      }),
      { numRuns: 4000 }
    );
  });

  it('v3: M-1 shares never open, M or more always do', async () => {
    await fc.assert(
      fc.asyncProperty(splitScenario, async ({ secret, n, m, picks }) => {
        const shares = await splitSecretV3(secret, n, m, {
          random: webCryptoRandom,
          aead: webCryptoAead,
        });
        const partial = await openSharesV3(
          subsetOfV3(shares, picks, m - 1),
          webCryptoAead
        );
        expect(partial.ok).toBe(false);
        const full = await openSharesV3(
          subsetOfV3(shares, picks, m),
          webCryptoAead
        );
        expect(full).toEqual({ ok: true, secret });
      }),
      { numRuns: 300 }
    );
  });
});

function subsetOfV3(shares: ShamirShareV3[], picks: number[], size: number) {
  const pool = [...shares];
  return Array.from(
    { length: size },
    (_, i) => pool.splice(picks[i] % pool.length, 1)[0]
  );
}
