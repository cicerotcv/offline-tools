import type { DigestPort } from '@/shared/domain/crypto/port';

/** Web Crypto SubtleCrypto digests. The only place that touches crypto.subtle. */
export const webCryptoDigest: DigestPort = {
  digest: async (algorithm, data) => {
    // Copy so the call never depends on the caller's backing buffer.
    const hash = await globalThis.crypto.subtle.digest(
      algorithm,
      new Uint8Array(data)
    );
    return new Uint8Array(hash);
  },
};
