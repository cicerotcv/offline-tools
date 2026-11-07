import { UseCase } from '@/shared/application/use-case';
import type { AeadPort, RandomPort } from '@/shared/domain/crypto/port';

import { MAX_SECRET_BYTES } from '../domain/sharing/limits';
import { decodeShares, encodeShareV3, formatSetId } from '../lib/encoding';
import { openSharesV3, type ShamirShareV3, splitSecretV3 } from '../lib/shamir';

export interface SplitSecretCommand {
  secret: string;
  totalShares: number;
  threshold: number;
}

export interface SplitSecretResult {
  /** One v3 share per entry, in share order. */
  encoded: string[];
  /** "A1B2-C3D4", the same in every share of this split. */
  setId: string;
  threshold: number;
  totalShares: number;
}

/**
 * Splits a text secret into authenticated v3 shares and verifies them before
 * returning: M decoded shares open the secret and M-1 do not.
 */
export class SplitSecretUseCase extends UseCase<
  SplitSecretCommand,
  Promise<SplitSecretResult>
> {
  constructor(
    private readonly deps: {
      random: Pick<RandomPort, 'getRandomValues'>;
      aead: Pick<AeadPort, 'seal' | 'open'>;
    }
  ) {
    super();
  }

  async execute({
    secret,
    totalShares: n,
    threshold: m,
  }: SplitSecretCommand): Promise<SplitSecretResult> {
    if (!secret.trim()) throw new Error('Input is required');
    if (m > n) {
      throw new Error('Threshold (M) cannot be greater than total shares (N)');
    }
    const bytes = new TextEncoder().encode(secret);
    if (bytes.byteLength > MAX_SECRET_BYTES) {
      throw new Error(
        `The secret is ${Math.ceil(bytes.byteLength / 1024)} KB; the limit is ${MAX_SECRET_BYTES / 1024} KB because every share carries it. Encrypt a large file with the Encryption tool and split only its password.`
      );
    }

    const shares = await splitSecretV3(bytes, n, m, this.deps);
    const encoded = shares.map(encodeShareV3);

    const decoded = decodeShares(encoded) as ShamirShareV3[];
    const full = await openSharesV3(decoded.slice(0, m), this.deps.aead);
    if (!full.ok || new TextDecoder().decode(full.secret) !== secret) {
      throw new Error(
        'Verification failed: shares cannot reconstruct the original secret'
      );
    }
    const partial = await openSharesV3(decoded.slice(0, m - 1), this.deps.aead);
    if (partial.ok) {
      throw new Error(
        'Verification failed: partial shares should not unlock the secret'
      );
    }

    return {
      encoded,
      setId: formatSetId(shares[0].setId),
      threshold: m,
      totalShares: n,
    };
  }
}
