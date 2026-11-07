import * as bip39 from 'bip39';
import { Buffer } from 'buffer';

import type { DigestPort, RandomPort } from '@/shared/domain/crypto/port';
import { webCryptoDigest } from '@/shared/infra/crypto/digest.web-crypto';
import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';
import { bytesToHex } from '@/shared/lib/bytes';

import type { WordCount } from '../../domain/bitcoin/config';
import { getWordCountConfig } from '../../domain/mnemonic/word-counts';
import { sha256 } from '../digest/digest';

export interface MnemonicRandomDeps {
  random: RandomPort;
  digest: DigestPort;
}

const defaultMnemonicRandomDeps: MnemonicRandomDeps = {
  random: webCryptoRandom,
  digest: webCryptoDigest,
};

/**
 * Generates a BIP39 mnemonic from cryptographically secure random bytes
 * @param wordCount - Number of words (12, 15, 18, 21, or 24)
 * @returns BIP39 mnemonic phrase
 */
export function generateMnemonicFromRandom(wordCount: WordCount): string {
  const config = getWordCountConfig(wordCount);
  const strength = config.entropyBits;
  return bip39.generateMnemonic(strength);
}

/**
 * Generates a BIP39 mnemonic from CSPRNG, optionally mixed with extra entropy.
 * Extra entropy is combined via SHA-256, it never replaces the CSPRNG output.
 */
export async function generateMnemonicFromRandomWithExtraEntropy(
  wordCount: WordCount,
  extraEntropy?: Uint8Array,
  deps: MnemonicRandomDeps = defaultMnemonicRandomDeps
): Promise<string> {
  const config = getWordCountConfig(wordCount);
  const csprngBytes = new Uint8Array(config.entropyBytes);
  deps.random.getRandomValues(csprngBytes);

  if (!extraEntropy || extraEntropy.length === 0) {
    const entropyBuffer = Buffer.from(csprngBytes);
    return bip39.entropyToMnemonic(entropyBuffer);
  }

  const combined = new Uint8Array(csprngBytes.length + extraEntropy.length);
  combined.set(csprngBytes, 0);
  combined.set(extraEntropy, csprngBytes.length);

  return generateMnemonicFromEntropy(combined, wordCount, deps.digest);
}

/**
 * Generates a BIP39 mnemonic from user-provided entropy
 * @param entropy - Entropy as Uint8Array (will be hashed to required length if longer)
 * @param wordCount - Target word count (12, 15, 18, 21, or 24)
 * @returns Promise resolving to BIP39 mnemonic phrase
 * @throws Error if entropy length is too short
 */
export async function generateMnemonicFromEntropy(
  entropy: Uint8Array,
  wordCount: WordCount,
  digest: DigestPort = webCryptoDigest
): Promise<string> {
  const config = getWordCountConfig(wordCount);
  const requiredBytes = config.entropyBytes;

  // Validate minimum entropy length
  if (entropy.length < requiredBytes) {
    throw new Error(
      `Invalid entropy length: ${entropy.length} bytes. Must be at least ${requiredBytes} bytes for ${wordCount} words.`
    );
  }

  let finalEntropy: Uint8Array;

  if (entropy.length === requiredBytes) {
    // Exact length, use as-is
    finalEntropy = entropy;
  } else {
    // Hash the entire entropy to derive the required length
    // This ensures all entropy bits contribute through cryptographic hashing
    // Create a new Uint8Array to ensure proper ArrayBuffer backing
    const entropyCopy = new Uint8Array(entropy);
    finalEntropy = (await sha256(entropyCopy, digest)).slice(0, requiredBytes);
  }

  const entropyBuffer = Buffer.from(finalEntropy);
  return bip39.entropyToMnemonic(entropyBuffer);
}

/**
 * Validates that entropy length is sufficient for the expected word count
 * @param entropy - Entropy as Uint8Array
 * @param wordCount - Expected word count
 * @returns true if valid (entropy is >= required length), false otherwise
 */
export function validateEntropyLength(
  entropy: Uint8Array,
  wordCount: WordCount
): boolean {
  const config = getWordCountConfig(wordCount);
  // More entropy is better, so we only check minimum length
  return entropy.length >= config.entropyBytes;
}

/**
 * Parses hex string entropy to Uint8Array
 * @param hexString - Hex string (e.g., "a1b2c3...")
 * @returns Uint8Array of entropy
 * @throws Error if hex string is invalid
 */
export function parseHexEntropy(hexString: string): Uint8Array {
  // Remove whitespace and convert to lowercase
  const cleaned = hexString.trim().toLowerCase().replace(/\s+/g, '');

  // Validate hex format
  if (!/^[0-9a-f]+$/.test(cleaned)) {
    throw new Error(
      'Invalid hex string. Must contain only 0-9 and a-f characters.'
    );
  }

  // Convert hex to bytes
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }

  return bytes;
}

/**
 * Extracts entropy from a mnemonic phrase
 * @param mnemonic - BIP39 mnemonic phrase
 * @returns Uint8Array of entropy
 * @throws Error if mnemonic is invalid
 */
export function getEntropyFromMnemonic(mnemonic: string): Uint8Array {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const entropyHex = bip39.mnemonicToEntropy(mnemonic);
  const entropyBuffer = Buffer.from(entropyHex, 'hex');
  return new Uint8Array(entropyBuffer);
}

/**
 * Derives seed from mnemonic using PBKDF2
 * @param mnemonic - BIP39 mnemonic phrase
 * @param passphrase - Optional passphrase (default: empty string)
 * @returns Promise resolving to seed as Uint8Array (64 bytes)
 */
export async function getSeedFromMnemonic(
  mnemonic: string,
  passphrase: string = ''
): Promise<Uint8Array> {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const seedBuffer = await bip39.mnemonicToSeed(mnemonic, passphrase);
  return new Uint8Array(seedBuffer);
}

/**
 * Validates a BIP39 mnemonic phrase
 * @param mnemonic - BIP39 mnemonic phrase
 * @returns true if valid, false otherwise
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

// Checksum calculation removed - not needed for core functionality
// The checksum is validated by bip39 library automatically

/**
 * Converts Uint8Array to hex string
 * @param bytes - Uint8Array
 * @returns Hex string
 */

export { bytesToHex };
