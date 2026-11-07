import { sha256 } from '@noble/hashes/sha2.js';

import type { RandomPort } from '@/shared/domain/crypto/port';
import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';

import type {
  ReconstructResult,
  ShamirShare,
} from '../../domain/sharing/share';

export type { ReconstructResult, ShamirShare };

/**
 * Encrypt-then-Shamir Secret Sharing over GF(256)
 * Splits an encryption key into N shares; the secret is always stored encrypted.
 * Fewer than M shares produce cryptographically illegible output (no error thrown).
 */

export const ENCRYPTION_KEY_LENGTH = 32;
export const NONCE_LENGTH = 12;
export const PLAINTEXT_MAGIC = 0x01;

// GF(256) operations using irreducible polynomial x^8 + x^4 + x^3 + x + 1
const GF256_IRREDUCIBLE = 0x11b;

function randomBytes(length: number, random: RandomPort): Uint8Array {
  const bytes = new Uint8Array(length);
  random.getRandomValues(bytes);
  return bytes;
}

/** GF(256) product (AES polynomial). Exported for tests only. */
export function gf256Multiply(a: number, b: number): number {
  let result = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) {
      result ^= a;
    }
    a <<= 1;
    if (a & 0x100) {
      a ^= GF256_IRREDUCIBLE;
    }
    b >>= 1;
  }
  return result & 0xff;
}

function gf256Add(a: number, b: number): number {
  return a ^ b;
}

/** GF(256) multiplicative inverse (a^254). Exported for tests only. */
export function gf256Inverse(a: number): number {
  if (a === 0) {
    throw new Error('Cannot compute inverse of 0');
  }
  if (a === 1) {
    return 1;
  }

  let result = 1;
  let base = a;
  let exponent = 254;

  while (exponent > 0) {
    if (exponent & 1) {
      result = gf256Multiply(result, base);
    }
    base = gf256Multiply(base, base);
    exponent >>= 1;
  }

  return result;
}

function gf256Divide(a: number, b: number): number {
  return gf256Multiply(a, gf256Inverse(b));
}

function evaluatePolynomial(coefficients: number[], x: number): number {
  let result = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    result = gf256Add(gf256Multiply(result, x), coefficients[i]);
  }
  return result;
}

function generateCoefficients(
  secretByte: number,
  threshold: number,
  random: RandomPort
): number[] {
  return [secretByte, ...randomBytes(threshold - 1, random)];
}

function expandKeystream(
  key: Uint8Array,
  nonce: Uint8Array,
  length: number
): Uint8Array {
  const stream = new Uint8Array(length);
  let offset = 0;
  let counter = 0;

  while (offset < length) {
    const blockInput = new Uint8Array(key.length + nonce.length + 4);
    blockInput.set(key);
    blockInput.set(nonce, key.length);
    blockInput[key.length + nonce.length] = (counter >>> 24) & 0xff;
    blockInput[key.length + nonce.length + 1] = (counter >>> 16) & 0xff;
    blockInput[key.length + nonce.length + 2] = (counter >>> 8) & 0xff;
    blockInput[key.length + nonce.length + 3] = counter & 0xff;

    const block = sha256(blockInput);
    const copyLength = Math.min(block.length, length - offset);
    stream.set(block.subarray(0, copyLength), offset);
    offset += copyLength;
    counter++;
  }

  return stream;
}

function xorStreamEncrypt(
  secret: Uint8Array,
  key: Uint8Array,
  nonce: Uint8Array
): Uint8Array {
  const plaintext = new Uint8Array(1 + secret.length);
  plaintext[0] = PLAINTEXT_MAGIC;
  plaintext.set(secret, 1);

  const keystream = expandKeystream(key, nonce, plaintext.length);
  const ciphertext = new Uint8Array(plaintext.length);
  for (let i = 0; i < plaintext.length; i++) {
    ciphertext[i] = plaintext[i] ^ keystream[i];
  }
  return ciphertext;
}

function xorStreamDecrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  nonce: Uint8Array
): Uint8Array {
  const keystream = expandKeystream(key, nonce, ciphertext.length);
  const plaintext = new Uint8Array(ciphertext.length);
  for (let i = 0; i < ciphertext.length; i++) {
    plaintext[i] = ciphertext[i] ^ keystream[i];
  }
  return plaintext;
}

export function isValidPlaintext(bytes: Uint8Array): boolean {
  return bytes.length >= 1 && bytes[0] === PLAINTEXT_MAGIC;
}

export function extractSecretFromPlaintext(bytes: Uint8Array): Uint8Array {
  return bytes.subarray(1);
}

export function validateSplitParams(n: number, m: number): void {
  if (m > n) {
    throw new Error('Threshold (M) cannot be greater than total shares (N)');
  }
  if (m < 2) {
    throw new Error('Threshold (M) must be at least 2');
  }
  if (n < 2) {
    throw new Error('Total shares (N) must be at least 2');
  }
  if (n > 255) {
    throw new Error('Total shares (N) cannot exceed 255');
  }
}

/** Shamir over GF(256), byte by byte. Shared by the v2 and v3 formats. */
export function splitKey(
  key: Uint8Array,
  n: number,
  m: number,
  random: RandomPort
): Array<{ x: number; y: Uint8Array }> {
  const keyLength = key.length;
  const coefficientsPerByte: number[][] = [];

  for (let byteIndex = 0; byteIndex < keyLength; byteIndex++) {
    coefficientsPerByte[byteIndex] = generateCoefficients(
      key[byteIndex],
      m,
      random
    );
  }

  const shares: Array<{ x: number; y: Uint8Array }> = [];
  for (let shareIndex = 1; shareIndex <= n; shareIndex++) {
    const shareBytes = new Uint8Array(keyLength);
    for (let byteIndex = 0; byteIndex < keyLength; byteIndex++) {
      shareBytes[byteIndex] = evaluatePolynomial(
        coefficientsPerByte[byteIndex],
        shareIndex
      );
    }
    shares.push({ x: shareIndex, y: shareBytes });
  }

  return shares;
}

/** Lagrange interpolation at x = 0, byte by byte. */
export function reconstructKey(
  shares: Array<{ x: number; y: Uint8Array }>
): Uint8Array {
  if (shares.length === 0) {
    throw new Error('At least one share is required');
  }

  const shareLength = shares[0].y.length;
  for (const share of shares) {
    if (share.y.length !== shareLength) {
      throw new Error('All shares must have the same length');
    }
  }

  const key = new Uint8Array(shareLength);

  for (let byteIndex = 0; byteIndex < shareLength; byteIndex++) {
    let reconstructedByte = 0;

    for (let i = 0; i < shares.length; i++) {
      let lagrangeCoeff = 1;

      for (let j = 0; j < shares.length; j++) {
        if (i !== j) {
          const numerator = shares[j].x;
          const denominator = gf256Add(shares[i].x, shares[j].x);
          if (denominator === 0) {
            throw new Error('Duplicate x values in shares');
          }
          lagrangeCoeff = gf256Multiply(
            lagrangeCoeff,
            gf256Divide(numerator, denominator)
          );
        }
      }

      reconstructedByte = gf256Add(
        reconstructedByte,
        gf256Multiply(lagrangeCoeff, shares[i].y[byteIndex])
      );
    }

    key[byteIndex] = reconstructedByte;
  }

  return key;
}

/**
 * Split a secret into N shares with threshold M (encrypt-then-Shamir)
 */
export function splitSecret(
  secret: Uint8Array,
  n: number,
  m: number,
  random: RandomPort = webCryptoRandom
): ShamirShare[] {
  validateSplitParams(n, m);

  const key = randomBytes(ENCRYPTION_KEY_LENGTH, random);
  const nonce = randomBytes(NONCE_LENGTH, random);
  const ciphertext = xorStreamEncrypt(secret, key, nonce);
  const keyShares = splitKey(key, n, m, random);

  return keyShares.map((share) => ({
    x: share.x,
    y: share.y,
    nonce,
    ciphertext,
  }));
}

/**
 * Reconstruct a secret from shares. Always returns output; invalid shares
 * produce illegible opaque bytes instead of throwing.
 */
export function reconstructSecret(shares: ShamirShare[]): ReconstructResult {
  if (shares.length === 0) {
    throw new Error('At least one share is required');
  }

  const { nonce, ciphertext } = shares[0];

  for (const share of shares) {
    if (share.nonce.length !== nonce.length) {
      throw new Error('Shares have inconsistent nonce values');
    }
    if (share.ciphertext.length !== ciphertext.length) {
      throw new Error('Shares have inconsistent ciphertext values');
    }
    if (!share.nonce.every((byte, i) => byte === nonce[i])) {
      throw new Error('Shares belong to different splits (nonce mismatch)');
    }
    if (!share.ciphertext.every((byte, i) => byte === ciphertext[i])) {
      throw new Error(
        'Shares belong to different splits (ciphertext mismatch)'
      );
    }
  }

  const keyShares = shares.map((share) => ({ x: share.x, y: share.y }));
  const reconstructedKey = reconstructKey(keyShares);
  const decrypted = xorStreamDecrypt(ciphertext, reconstructedKey, nonce);

  if (isValidPlaintext(decrypted)) {
    return {
      isValid: true,
      secret: extractSecretFromPlaintext(decrypted),
    };
  }

  return {
    isValid: false,
    opaque: decrypted,
  };
}
