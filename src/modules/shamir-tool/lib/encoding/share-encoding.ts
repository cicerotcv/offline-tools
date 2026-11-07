import { sha256 } from '@noble/hashes/sha2.js';

import { Base64 } from '@/shared/lib/base64';

import {
  ENCRYPTION_KEY_LENGTH,
  NONCE_LENGTH,
  type ShamirShare,
} from '../shamir/shamir';
import {
  assertSameSplit,
  GCM_TAG_LENGTH,
  SET_ID_LENGTH,
  type ShamirShareV3,
} from '../shamir/v3';

/**
 * Share encoding v2, encrypt-then-Shamir format
 * Layout: [0x00][0x02][m][n][x][y × 32][nonce × 12][ct_len u16 BE][ciphertext]
 */

export const SHARE_VERSION = 2;
export const SHARE_VERSION_MARKER = 0x00;
export const SHARE_VERSION_BYTE = 0x02;

export interface ShareMetadata {
  threshold: number;
  totalShares: number;
  version: typeof SHARE_VERSION;
}

export interface EncodedShare extends ShamirShare, ShareMetadata {}

export interface EncodeShareOptions {
  m: number;
  n: number;
}

function writeUint16BE(view: Uint8Array, offset: number, value: number): void {
  view[offset] = (value >>> 8) & 0xff;
  view[offset + 1] = value & 0xff;
}

function readUint16BE(view: Uint8Array, offset: number): number {
  return (view[offset] << 8) | view[offset + 1];
}

/**
 * Encode a share to URL-safe base64 (v2 format)
 */
export function encodeShare(
  share: ShamirShare,
  options: EncodeShareOptions
): string {
  const { m, n } = options;

  if (share.x < 1 || share.x > 255) {
    throw new Error('Share index must be between 1 and 255');
  }
  if (m < 2 || m > 255 || n < m || n > 255) {
    throw new Error('Invalid threshold (M) or total shares (N)');
  }
  if (share.y.length !== ENCRYPTION_KEY_LENGTH) {
    throw new Error(`Share key part must be ${ENCRYPTION_KEY_LENGTH} bytes`);
  }
  if (share.nonce.length !== NONCE_LENGTH) {
    throw new Error(`Nonce must be ${NONCE_LENGTH} bytes`);
  }

  const headerLength = 5;
  const ctLengthField = 2;
  const totalLength =
    headerLength +
    ENCRYPTION_KEY_LENGTH +
    NONCE_LENGTH +
    ctLengthField +
    share.ciphertext.length;

  const buffer = new Uint8Array(totalLength);
  let offset = 0;

  buffer[offset++] = SHARE_VERSION_MARKER;
  buffer[offset++] = SHARE_VERSION_BYTE;
  buffer[offset++] = m;
  buffer[offset++] = n;
  buffer[offset++] = share.x;
  buffer.set(share.y, offset);
  offset += ENCRYPTION_KEY_LENGTH;
  buffer.set(share.nonce, offset);
  offset += NONCE_LENGTH;
  writeUint16BE(buffer, offset, share.ciphertext.length);
  offset += ctLengthField;
  buffer.set(share.ciphertext, offset);

  return Base64.encodeBufferUrlSafe(buffer.buffer);
}

/** Any share this tool can read. */
export type AnyShare = EncodedShare | ShamirShareV3;

/**
 * Decode a share from v2 URL-safe base64 format
 */
function decodeShareV2(shareString: string): EncodedShare {
  const trimmed = shareString.trim();

  // Optional index prefix: "x:v2base64" (display format only)
  if (trimmed.includes(':')) {
    const colonIndex = trimmed.indexOf(':');
    const prefix = trimmed.slice(0, colonIndex);
    const payload = trimmed.slice(colonIndex + 1);

    if (/^\d+$/.test(prefix) && payload.length > 0) {
      return decodeShareV2(payload);
    }

    throw new Error(
      'Legacy share format is no longer supported. Re-split your secret with the current version.'
    );
  }

  let buffer: ArrayBuffer;
  try {
    buffer = Base64.decodeToBuffer(trimmed);
  } catch {
    throw new Error('Invalid share format: invalid base64 data');
  }

  const view = new Uint8Array(buffer);

  if (view.length < 2) {
    throw new Error(
      'Legacy share format is no longer supported. Re-split your secret with the current version.'
    );
  }

  if (view[0] !== SHARE_VERSION_MARKER || view[1] !== SHARE_VERSION_BYTE) {
    throw new Error(
      'Legacy share format is no longer supported. Re-split your secret with the current version.'
    );
  }

  const minLength = 5 + ENCRYPTION_KEY_LENGTH + NONCE_LENGTH + 2;

  if (view.length < minLength) {
    throw new Error('Share data too short for v2 format');
  }

  const m = view[2];
  const n = view[3];
  const x = view[4];

  if (m < 2 || n < m || n > 255) {
    throw new Error('Invalid threshold or total shares in share data');
  }
  if (x < 1 || x > n) {
    throw new Error('Invalid share index in data');
  }

  let offset = 5;
  const y = view.slice(offset, offset + ENCRYPTION_KEY_LENGTH);
  offset += ENCRYPTION_KEY_LENGTH;

  const nonce = view.slice(offset, offset + NONCE_LENGTH);
  offset += NONCE_LENGTH;

  const ctLength = readUint16BE(view, offset);
  offset += 2;

  if (offset + ctLength !== view.length) {
    throw new Error('Invalid ciphertext length in share data');
  }

  const ciphertext = view.slice(offset, offset + ctLength);

  return {
    version: SHARE_VERSION,
    threshold: m,
    totalShares: n,
    x,
    y,
    nonce,
    ciphertext,
  };
}

/**
 * Encode multiple shares
 */
export function encodeShares(
  shares: ShamirShare[],
  options: EncodeShareOptions
): string[] {
  return shares.map((share) => encodeShare(share, options));
}

/**
 * The text users copy or save: one v2 share per line, the exact input the
 * reconstruct step reads back.
 */
export function sharesToText(
  shares: ShamirShare[],
  options: EncodeShareOptions
): string {
  return encodeShares(shares, options).join('\n');
}

/**
 * Decode multiple v2 shares and validate consistency
 */
function decodeSharesV2(shareStrings: string[]): EncodedShare[] {
  const shares = shareStrings.map(decodeShareV2);

  if (shares.length === 0) {
    return shares;
  }

  const { threshold, totalShares, nonce, ciphertext } = shares[0];

  for (const share of shares) {
    if (share.threshold !== threshold) {
      throw new Error('Shares have inconsistent threshold (M) values');
    }
    if (share.totalShares !== totalShares) {
      throw new Error('Shares have inconsistent total share (N) values');
    }
    if (share.nonce.length !== nonce.length) {
      throw new Error('Shares have inconsistent nonce values');
    }
    if (!share.nonce.every((byte, i) => byte === nonce[i])) {
      throw new Error('Shares belong to different splits (nonce mismatch)');
    }
    if (share.ciphertext.length !== ciphertext.length) {
      throw new Error('Shares have inconsistent ciphertext values');
    }
    if (!share.ciphertext.every((byte, i) => byte === ciphertext[i])) {
      throw new Error(
        'Shares belong to different splits (ciphertext mismatch)'
      );
    }
  }

  return shares;
}

// ---------------------------------------------------------------------------
// v3: [0x00][0x03][m][n][x][setId ×4][y ×32][nonce ×12][len u16][sealed][checksum ×4]
// The checksum (first 4 bytes of SHA-256 over everything before it) points
// to a damaged share before any combining; the GCM tag guards the result.
// ---------------------------------------------------------------------------

export const SHARE_VERSION_3 = 0x03;
const V3_HEADER = 5 + SET_ID_LENGTH;
const CHECKSUM_LENGTH = 4;
const V3_FIXED = V3_HEADER + ENCRYPTION_KEY_LENGTH + NONCE_LENGTH + 2;

const checksumOf = (bytes: Uint8Array) =>
  sha256(bytes).subarray(0, CHECKSUM_LENGTH);

export function encodeShareV3(share: ShamirShareV3): string {
  const { threshold: m, totalShares: n, x } = share;
  if (x < 1 || x > n || m < 2 || n < m || n > 255) {
    throw new Error('Invalid share index, threshold (M) or total shares (N)');
  }
  if (share.sealed.length > 0xffff) throw new Error('Secret too large');
  const body = new Uint8Array(V3_FIXED + share.sealed.length);
  let offset = 0;
  body.set([SHARE_VERSION_MARKER, SHARE_VERSION_3, m, n, x], offset);
  offset += 5;
  body.set(share.setId, offset);
  offset += SET_ID_LENGTH;
  body.set(share.y, offset);
  offset += ENCRYPTION_KEY_LENGTH;
  body.set(share.nonce, offset);
  offset += NONCE_LENGTH;
  writeUint16BE(body, offset, share.sealed.length);
  offset += 2;
  body.set(share.sealed, offset);
  const out = new Uint8Array(body.length + CHECKSUM_LENGTH);
  out.set(body);
  out.set(checksumOf(body), body.length);
  return Base64.encodeBufferUrlSafe(out.buffer);
}

export class DamagedShareError extends Error {}

function decodeShareV3(view: Uint8Array): ShamirShareV3 {
  if (view.length < V3_FIXED + GCM_TAG_LENGTH + CHECKSUM_LENGTH) {
    throw new Error('Share data too short for v3 format');
  }
  const body = view.subarray(0, view.length - CHECKSUM_LENGTH);
  const checksum = view.subarray(view.length - CHECKSUM_LENGTH);
  if (!checksumOf(body).every((byte, i) => byte === checksum[i])) {
    throw new DamagedShareError(
      'The share is damaged or mistyped (checksum mismatch)'
    );
  }
  const m = body[2];
  const n = body[3];
  const x = body[4];
  if (m < 2 || n < m || x < 1 || x > n) {
    throw new Error('Invalid threshold, total or index in share data');
  }
  let offset = 5;
  const setId = body.slice(offset, offset + SET_ID_LENGTH);
  offset += SET_ID_LENGTH;
  const y = body.slice(offset, offset + ENCRYPTION_KEY_LENGTH);
  offset += ENCRYPTION_KEY_LENGTH;
  const nonce = body.slice(offset, offset + NONCE_LENGTH);
  offset += NONCE_LENGTH;
  const length = readUint16BE(body, offset);
  offset += 2;
  if (offset + length !== body.length) {
    throw new Error('Invalid ciphertext length in share data');
  }
  return {
    version: 3,
    threshold: m,
    totalShares: n,
    setId,
    x,
    y,
    nonce,
    sealed: body.slice(offset),
  };
}

/** Reads a v2 or v3 share. */
export function decodeShare(shareString: string): AnyShare {
  const trimmed = shareString.trim();
  if (!trimmed.includes(':')) {
    let view: Uint8Array | null = null;
    try {
      view = new Uint8Array(Base64.decodeToBuffer(trimmed));
    } catch {
      // Falls through to the v2 decoder, which reports the error.
    }
    if (
      view &&
      view[0] === SHARE_VERSION_MARKER &&
      view[1] === SHARE_VERSION_3
    ) {
      return decodeShareV3(view);
    }
  }
  return decodeShareV2(trimmed);
}

/** Decodes shares of one format and checks that they belong together. */
export function decodeShares(shareStrings: string[]): AnyShare[] {
  const shares = shareStrings.map(decodeShare);
  if (shares.length === 0) return shares;
  const versions = new Set(shares.map((share) => share.version));
  if (versions.size > 1) {
    throw new Error(
      'The shares mix formats (v2 and v3) from different splits.'
    );
  }
  if (shares[0].version === 3) {
    assertSameSplit(shares as ShamirShareV3[]);
    return shares;
  }
  return decodeSharesV2(shareStrings);
}

/** "A1B2-C3D4": how a set id is shown to people. */
export function formatSetId(setId: Uint8Array): string {
  const hex = Array.from(setId, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4)}`;
}
