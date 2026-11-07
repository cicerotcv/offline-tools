import { describe, expect, it } from 'vitest';

import { webCryptoDigest } from '@/shared/infra/crypto/digest.web-crypto';

import { sha256 } from './digest';

describe('digest', () => {
  it('hashes empty input with known SHA-256 vector', async () => {
    const hash = await sha256(new Uint8Array(0));
    expect(
      Array.from(hash)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    ).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('hashes via webCryptoDigest directly', async () => {
    const data = new TextEncoder().encode('abc');
    const hash = await webCryptoDigest.digest('SHA-256', data);
    expect(
      Array.from(hash)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    ).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});
