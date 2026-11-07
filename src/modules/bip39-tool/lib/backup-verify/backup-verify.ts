import type { RandomPort } from '@/shared/domain/crypto/port';
import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';

/**
 * Picks unique random word indices (0-based) for backup verification.
 */
export function pickVerificationIndices(
  wordCount: number,
  count = 3,
  random: RandomPort = webCryptoRandom
): number[] {
  if (wordCount < 1) {
    throw new Error('wordCount must be at least 1');
  }

  const pickCount = Math.min(count, wordCount);
  const indices: number[] = [];
  const available = Array.from({ length: wordCount }, (_, i) => i);

  while (indices.length < pickCount) {
    const randomBytes = new Uint8Array(1);
    random.getRandomValues(randomBytes);
    const pickIndex = randomBytes[0] % available.length;
    indices.push(available[pickIndex]);
    available.splice(pickIndex, 1);
  }

  return indices.sort((a, b) => a - b);
}

/**
 * Verifies user-provided words against the mnemonic at given indices.
 */
export function verifyWords(
  mnemonic: string,
  answers: Record<number, string>
): boolean {
  const words = mnemonic.trim().split(/\s+/);

  for (const [indexStr, answer] of Object.entries(answers)) {
    const index = Number(indexStr);
    if (Number.isNaN(index) || index < 0 || index >= words.length) {
      return false;
    }

    const normalizedAnswer = answer.trim().toLowerCase();
    const expectedWord = words[index].toLowerCase();

    if (normalizedAnswer !== expectedWord) {
      return false;
    }
  }

  return true;
}
