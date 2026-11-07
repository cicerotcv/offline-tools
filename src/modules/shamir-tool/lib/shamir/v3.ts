import type { AeadPort, RandomPort } from '@/shared/domain/crypto/port';

import {
  ENCRYPTION_KEY_LENGTH,
  NONCE_LENGTH,
  reconstructKey,
  splitKey,
  validateSplitParams,
} from './shamir';

/*
 * Share format v3: the secret is sealed with AES-256-GCM under a random key,
 * and only the key is split with Shamir. The header (version, M, N, set id)
 * is authenticated data, so a share cannot be relabelled, and a result is
 * valid only when the 128-bit tag verifies.
 */

export const SET_ID_LENGTH = 4;
export const GCM_TAG_LENGTH = 16;

export interface ShamirShareV3 {
  version: 3;
  threshold: number;
  totalShares: number;
  setId: Uint8Array;
  x: number;
  y: Uint8Array;
  nonce: Uint8Array;
  /** Ciphertext followed by the GCM tag; identical in every share. */
  sealed: Uint8Array;
}

export type OpenResult = { ok: true; secret: Uint8Array } | { ok: false };

/** The authenticated header: [0x00][0x03][m][n][setId]. */
export function v3Header(m: number, n: number, setId: Uint8Array): Uint8Array {
  return Uint8Array.from([0x00, 0x03, m, n, ...setId]);
}

function randomBytes(
  length: number,
  random: Pick<RandomPort, 'getRandomValues'>
) {
  const bytes = new Uint8Array(length);
  random.getRandomValues(bytes);
  return bytes;
}

export async function splitSecretV3(
  secret: Uint8Array,
  n: number,
  m: number,
  deps: {
    random: Pick<RandomPort, 'getRandomValues'>;
    aead: Pick<AeadPort, 'seal'>;
  }
): Promise<ShamirShareV3[]> {
  validateSplitParams(n, m);
  const key = randomBytes(ENCRYPTION_KEY_LENGTH, deps.random);
  const nonce = randomBytes(NONCE_LENGTH, deps.random);
  const setId = randomBytes(SET_ID_LENGTH, deps.random);
  const sealed = await deps.aead.seal(
    key,
    nonce,
    secret,
    v3Header(m, n, setId)
  );
  const keyShares = splitKey(key, n, m, deps.random);
  key.fill(0);
  return keyShares.map(({ x, y }) => ({
    version: 3,
    threshold: m,
    totalShares: n,
    setId,
    x,
    y,
    nonce,
    sealed,
  }));
}

const sameBytes = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((byte, i) => byte === b[i]);

/** Throws when the shares do not come from one split. */
export function assertSameSplit(shares: readonly ShamirShareV3[]): void {
  const [first] = shares;
  for (const share of shares) {
    if (
      share.threshold !== first.threshold ||
      share.totalShares !== first.totalShares ||
      !sameBytes(share.setId, first.setId)
    ) {
      throw new Error('The shares come from different sets.');
    }
    if (
      !sameBytes(share.nonce, first.nonce) ||
      !sameBytes(share.sealed, first.sealed)
    ) {
      throw new Error('The shares come from different splits.');
    }
  }
}

/**
 * Rebuilds the key from the given shares and opens the sealed secret. The
 * result is valid only if the GCM tag verifies, so a damaged share or too
 * few shares never produce a wrong secret.
 */
export async function openSharesV3(
  shares: readonly ShamirShareV3[],
  aead: Pick<AeadPort, 'open'>
): Promise<OpenResult> {
  if (shares.length === 0) throw new Error('At least one share is required');
  assertSameSplit(shares);
  const { threshold, totalShares, setId, nonce, sealed } = shares[0];
  const key = reconstructKey(shares.map(({ x, y }) => ({ x, y })));
  const secret = await aead.open(
    key,
    nonce,
    sealed,
    v3Header(threshold, totalShares, setId)
  );
  key.fill(0);
  return secret ? { ok: true, secret } : { ok: false };
}
