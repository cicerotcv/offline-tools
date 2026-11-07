import type { AeadPort } from '@/shared/domain/crypto/port';

const ALGORITHM = 'AES-GCM';
const TAG_BITS = 128;

// Copies so the calls never depend on the caller's backing buffer.
const copy = (bytes: Uint8Array) => new Uint8Array(bytes);

async function importKey(key: Uint8Array, usage: KeyUsage) {
  if (key.length !== 32) throw new Error('AES-256-GCM needs a 32-byte key');
  return globalThis.crypto.subtle.importKey(
    'raw',
    copy(key),
    ALGORITHM,
    false,
    [usage]
  );
}

/** AES-256-GCM through Web Crypto (available offline and on file://). */
export const webCryptoAead: AeadPort = {
  async seal(key, nonce, plaintext, aad) {
    const sealed = await globalThis.crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: copy(nonce),
        additionalData: copy(aad),
        tagLength: TAG_BITS,
      },
      await importKey(key, 'encrypt'),
      copy(plaintext)
    );
    return new Uint8Array(sealed);
  },
  async open(key, nonce, sealed, aad) {
    try {
      const plaintext = await globalThis.crypto.subtle.decrypt(
        {
          name: ALGORITHM,
          iv: copy(nonce),
          additionalData: copy(aad),
          tagLength: TAG_BITS,
        },
        await importKey(key, 'decrypt'),
        copy(sealed)
      );
      return new Uint8Array(plaintext);
    } catch {
      return null;
    }
  },
};
