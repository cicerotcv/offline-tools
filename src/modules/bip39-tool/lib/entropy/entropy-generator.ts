/**
 * Entropy Generator
 * Collects and combines entropy from multiple sources for cryptographically secure random data
 */
import { bytesToHex } from '@/shared/lib/bytes';
import { mouseEntropyFromSamples } from '@/shared/lib/entropy/mouse';

import { sha256 } from '../digest/digest';

/**
 * Collects entropy from text input by hashing it
 * @param text - Text input
 * @returns Uint8Array of entropy (32 bytes from SHA-256)
 */
export async function collectTextEntropy(text: string): Promise<Uint8Array> {
  if (!text.trim()) {
    throw new Error('Text input is required');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return sha256(data);
}

/**
 * Collects entropy from file by hashing its content
 * @param file - File object
 * @returns Uint8Array of entropy (32 bytes from SHA-256)
 */
export async function collectFileEntropy(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return sha256(new Uint8Array(arrayBuffer));
}

/**
 * Collects entropy from camera image by hashing it
 * @param blob - Image blob from camera
 * @returns Uint8Array of entropy (32 bytes from SHA-256)
 */
export async function collectCameraEntropy(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  return sha256(new Uint8Array(arrayBuffer));
}

/**
 * Collects entropy from mouse movements
 * @param positions - Array of mouse positions with timestamps
 * @returns Uint8Array of entropy (32 bytes from SHA-256)
 */
export async function collectMouseEntropy(
  positions: Array<{ x: number; y: number; timestamp: number }>
): Promise<Uint8Array> {
  return mouseEntropyFromSamples(positions);
}

/**
 * Combines multiple entropy sources using XOR and final hash
 * @param sources - Array of entropy sources (each should be 32 bytes from SHA-256)
 * @returns Uint8Array of combined entropy (32 bytes)
 */
export async function combineEntropy(
  sources: Uint8Array[]
): Promise<Uint8Array> {
  if (sources.length === 0) {
    throw new Error('At least one entropy source is required');
  }

  // If only one source, return it
  if (sources.length === 1) {
    return sources[0];
  }

  // XOR all sources together
  const combined = new Uint8Array(32);
  for (const source of sources) {
    if (source.length !== 32) {
      throw new Error('All entropy sources must be 32 bytes (SHA-256 output)');
    }
    for (let i = 0; i < 32; i++) {
      combined[i] ^= source[i];
    }
  }

  // Final hash for additional mixing
  return sha256(combined);
}

/**
 * Converts entropy bytes to hex string
 * @param entropy - Entropy as Uint8Array
 * @returns Hex string
 */
export function entropyToHex(entropy: Uint8Array): string {
  return bytesToHex(entropy);
}

/**
 * Gets the number of bits from entropy bytes
 * @param entropy - Entropy as Uint8Array
 * @returns Number of bits
 */
export function getEntropyBits(entropy: Uint8Array): number {
  return entropy.length * 8;
}
