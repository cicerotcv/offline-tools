import { describe, expect, it } from 'vitest';

import { bytesToHex, hexToBytes } from '@/shared/lib/bytes';

import { webCryptoAead } from './aead.web-crypto';

// NIST GCM test vector (gcmEncryptExtIV256, Count 0 of the AAD set):
// McGrew & Viega test case 16 style, 256-bit key, 96-bit IV, with AAD.
const KEY = hexToBytes(
  'feffe9928665731c6d6a8f9467308308feffe9928665731c6d6a8f9467308308'
);
const IV = hexToBytes('cafebabefacedbaddecaf888');
const PLAINTEXT = hexToBytes(
  'd9313225f88406e5a55909c5aff5269a86a7a9531534f7da2e4c303d8a318a721c3c0c95956809532fcf0e2449a6b525b16aedf5aa0de657ba637b39'
);
const AAD = hexToBytes('feedfacedeadbeeffeedfacedeadbeefabaddad2');
const CIPHERTEXT =
  '522dc1f099567d07f47f37a32a84427d643a8cdcbfe5c0c97598a2bd2555d1aa8cb08e48590dbb3da7b08b1056828838c5f61e6393ba7a0abcc9f662';
const TAG = '76fc6ece0f4e1768cddf8853bb2d551b';

describe('webCryptoAead (AES-256-GCM)', () => {
  it('matches the GCM specification test case 16', async () => {
    const sealed = await webCryptoAead.seal(KEY, IV, PLAINTEXT, AAD);
    expect(bytesToHex(sealed)).toBe(CIPHERTEXT + TAG);
    expect(await webCryptoAead.open(KEY, IV, sealed, AAD)).toEqual(PLAINTEXT);
  });

  it('rejects a flipped bit, a wrong key or different AAD', async () => {
    const sealed = await webCryptoAead.seal(KEY, IV, PLAINTEXT, AAD);
    const flipped = sealed.slice();
    flipped[3] ^= 1;
    expect(await webCryptoAead.open(KEY, IV, flipped, AAD)).toBeNull();
    const otherKey = KEY.slice();
    otherKey[0] ^= 1;
    expect(await webCryptoAead.open(otherKey, IV, sealed, AAD)).toBeNull();
    expect(
      await webCryptoAead.open(KEY, IV, sealed, AAD.subarray(1))
    ).toBeNull();
  });
});
