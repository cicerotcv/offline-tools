import { UseCase } from '@/shared/application/use-case';
import type { AeadPort } from '@/shared/domain/crypto/port';

import {
  analyzeShareLines,
  decodeShares,
  type EncodedShare,
  type ShareLine,
} from '../lib/encoding';
import {
  openSharesV3,
  reconstructSecret,
  type ShamirShareV3,
} from '../lib/shamir';

export interface ReconstructSecretCommand {
  /** One encoded share per line; blank lines are ignored. */
  shareText: string;
}

export type ReconstructSecretResult =
  | {
      kind: 'valid';
      secret: string;
      /** v2 shares: no authentication, only the 1-byte marker. */
      legacy: boolean;
      /** Share numbers that took no part in any combination that opened. */
      suspects: number[];
      /** Pasted lines left out: damaged, from another set or conflicting. */
      skipped: number[];
    }
  | {
      kind: 'opaque';
      opaque: Uint8Array;
      threshold: number;
      have: number;
      skipped: number[];
    }
  | { kind: 'rejected'; threshold: number; skipped: number[] };

/** Upper bound on combinations tried to find which share is damaged. */
const MAX_COMBINATIONS = 2000;

function* combinations<T>(items: readonly T[], size: number): Generator<T[]> {
  if (size === 0) {
    yield [];
    return;
  }
  for (let i = 0; i <= items.length - size; i++) {
    for (const rest of combinations(items.slice(i + 1), size - 1)) {
      yield [items[i], ...rest];
    }
  }
}

/**
 * Recovers a secret from v3 (authenticated) or v2 shares. With v3 a result is
 * valid only when the GCM tag verifies; if the given shares do not open and
 * there are more than M, combinations of M are tried to name the bad share.
 */
export class ReconstructSecretUseCase extends UseCase<
  ReconstructSecretCommand,
  Promise<ReconstructSecretResult>
> {
  constructor(private readonly aead: Pick<AeadPort, 'open'>) {
    super();
  }

  async execute({
    shareText,
  }: ReconstructSecretCommand): Promise<ReconstructSecretResult> {
    const { shares, skipped } = selectShares(shareText);
    const result =
      shares[0].version === 3
        ? await this.openV3(shares as ShamirShareV3[])
        : openV2(shares as EncodedShare[]);
    return { ...result, skipped } as ReconstructSecretResult;
  }

  private async openV3(shares: ShamirShareV3[]): Promise<Partial<Result>> {
    const { threshold, sealed } = shares[0];
    if (shares.length < threshold) {
      return { kind: 'opaque', opaque: sealed, threshold, have: shares.length };
    }

    const all = await openSharesV3(shares, this.aead);
    if (all.ok) {
      return valid(all.secret, false, []);
    }
    if (shares.length === threshold) return { kind: 'rejected', threshold };

    let secret: Uint8Array | null = null;
    const trusted = new Set<number>();
    let tried = 0;
    for (const subset of combinations(shares, threshold)) {
      if (++tried > MAX_COMBINATIONS) break;
      const result = await openSharesV3(subset, this.aead);
      if (result.ok) {
        secret = result.secret;
        subset.forEach((share) => trusted.add(share.x));
      }
    }
    if (!secret) return { kind: 'rejected', threshold };
    const suspects = shares
      .map((share) => share.x)
      .filter((x) => !trusted.has(x));
    return valid(secret, false, suspects);
  }
}

/** A result before the skipped lines are attached. */
type Result = DistributiveOmit<ReconstructSecretResult, 'skipped'>;
type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

function valid(
  secret: Uint8Array,
  legacy: boolean,
  suspects: number[]
): Result {
  return {
    kind: 'valid',
    secret: new TextDecoder().decode(secret),
    legacy,
    suspects,
  };
}

/**
 * v2: fewer shares than the threshold embedded in them never count as valid,
 * even if the 1-byte plaintext marker happens to match.
 */
function openV2(shares: EncodedShare[]): Result {
  const threshold = shares[0].threshold;
  const result = reconstructSecret(shares);
  if (result.isValid && shares.length >= threshold) {
    return valid(result.secret, true, []);
  }
  return {
    kind: 'opaque',
    opaque: result.isValid ? result.secret : result.opaque,
    threshold,
    have: shares.length,
  };
}

const USABLE = new Set(['ok', 'legacy']);
const IGNORED = new Set(['duplicate']);

/**
 * Picks the shares to combine with the same rules the live view shows:
 * the largest set, one line per share number, duplicates ignored. Damaged,
 * conflicting or foreign lines are skipped when enough good shares remain;
 * otherwise the first problem is reported.
 */
function selectShares(shareText: string) {
  const analysis = analyzeShareLines(shareText);
  if (analysis.lines.length === 0) throw new Error('No valid shares found');

  const usable = analysis.lines.filter((line) => USABLE.has(line.status));
  const problems = analysis.lines.filter(
    (line) => !USABLE.has(line.status) && !IGNORED.has(line.status)
  );
  const enough =
    analysis.threshold !== undefined && usable.length >= analysis.threshold;
  if (usable.length === 0 || (!enough && problems.length > 0)) {
    throw new Error(describe(problems[0], analysis.lines.indexOf(problems[0])));
  }

  return {
    shares: decodeShares(usable.map((line) => line.value)),
    skipped: problems.map((line) => line.line),
  };
}

function describe(line: ShareLine, index: number): string {
  if (line.status === 'other-set') {
    return `Share ${index + 1} comes from a different set than the others.`;
  }
  if (line.status === 'conflict') {
    return `Two different shares claim to be share ${line.x}. One of them is damaged; remove it.`;
  }
  const reason = line.message ?? 'unreadable';
  const truncated = /too short|ciphertext length|invalid base64/i.test(reason);
  return `Share ${index + 1} cannot be read: ${reason}.${
    truncated ? ' If it was broken across lines, join it into one line.' : ''
  }`;
}
