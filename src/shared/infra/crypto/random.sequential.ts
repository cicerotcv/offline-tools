import type { RandomPort } from '@/shared/domain/crypto/port';

/**
 * Deterministic RNG for tests only: fills buffers from a fixed byte
 * sequence, cycling when exhausted. Never use it in application code.
 */
export function createSequentialRandom(bytes: readonly number[]): RandomPort {
  let offset = 0;
  return {
    getRandomValues(buffer) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = bytes[offset % bytes.length];
        offset++;
      }
    },
  };
}
