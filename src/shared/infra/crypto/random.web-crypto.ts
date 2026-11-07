import type { RandomPort } from '@/shared/domain/crypto/port';

/** Browser CSPRNG. The only place in the app that calls getRandomValues. */
export const webCryptoRandom: RandomPort = {
  getRandomValues: (buffer) => {
    globalThis.crypto.getRandomValues(buffer);
  },
};
