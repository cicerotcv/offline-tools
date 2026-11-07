import { describe, expect, it } from 'vitest';

import { webCryptoAead } from '@/shared/infra/crypto/aead.web-crypto';
import { createSequentialRandom } from '@/shared/infra/crypto/random.sequential';
import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';
import { Base64 } from '@/shared/lib/base64';

import { SHAMIR_V3_VECTOR } from '../domain/vectors/v3-vectors';
import { ReconstructSecretUseCase } from './reconstruct-secret.use-case';
import { SplitSecretUseCase } from './split-secret.use-case';

const split = new SplitSecretUseCase({
  random: webCryptoRandom,
  aead: webCryptoAead,
});
const reconstruct = new ReconstructSecretUseCase(webCryptoAead);
const recover = (lines: readonly string[]) =>
  reconstruct.execute({ shareText: lines.join('\n') });

/** Flips one bit inside a share's key part and recomputes nothing. */
function damageKeyPart(share: string): string {
  const bytes = new Uint8Array(Base64.decodeToBuffer(share));
  bytes[20] ^= 0x01;
  return Base64.encodeBufferUrlSafe(bytes.buffer);
}

describe('secret sharing use cases (v3, authenticated)', () => {
  it('splits, encodes and reconstructs a text secret', async () => {
    const { encoded, setId } = await split.execute({
      secret: 'correct horse battery staple',
      totalShares: 5,
      threshold: 3,
    });
    expect(encoded).toHaveLength(5);
    expect(setId).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);

    const result = await reconstruct.execute({
      shareText: `\n${encoded[4]}\n\n${encoded[0]}\n${encoded[2]}\n`,
    });
    expect(result).toEqual({
      kind: 'valid',
      secret: 'correct horse battery staple',
      legacy: false,
      suspects: [],
      skipped: [],
    });
  });

  it('never reports fewer shares than the threshold as valid', async () => {
    for (let i = 0; i < 100; i++) {
      const { encoded } = await split.execute({
        secret: 'seed words',
        totalShares: 3,
        threshold: 3,
      });
      expect((await recover(encoded.slice(0, 2))).kind).toBe('opaque');
    }
  });

  it('flags a damaged share by its checksum', async () => {
    const { encoded } = await split.execute({
      secret: 'hello',
      totalShares: 3,
      threshold: 2,
    });
    await expect(
      recover([damageKeyPart(encoded[0]), encoded[1]])
    ).rejects.toThrow(/damaged or mistyped/);
  });

  it('never accepts a wrong secret, even when the checksum was forged', async () => {
    // A share altered by someone who recomputed its checksum: only the GCM
    // tag stands between it and a wrong secret.
    const { encoded } = await split.execute({
      secret: 'hello',
      totalShares: 3,
      threshold: 3,
    });
    const { sha256 } = await import('@noble/hashes/sha2.js');
    const bytes = new Uint8Array(Base64.decodeToBuffer(encoded[0]));
    bytes[20] ^= 0x01;
    const body = bytes.subarray(0, bytes.length - 4);
    bytes.set(sha256(body).subarray(0, 4), bytes.length - 4);
    const forged = Base64.encodeBufferUrlSafe(bytes.buffer);
    expect((await recover([forged, encoded[1], encoded[2]])).kind).toBe(
      'rejected'
    );
  });

  it('names the bad share when more than M are given', async () => {
    const { encoded } = await split.execute({
      secret: 'hello',
      totalShares: 5,
      threshold: 3,
    });
    const { sha256 } = await import('@noble/hashes/sha2.js');
    const bytes = new Uint8Array(Base64.decodeToBuffer(encoded[3]));
    bytes[25] ^= 0x10;
    bytes.set(
      sha256(bytes.subarray(0, bytes.length - 4)).subarray(0, 4),
      bytes.length - 4
    );
    const forged = Base64.encodeBufferUrlSafe(bytes.buffer);
    const result = await recover([encoded[0], encoded[1], encoded[2], forged]);
    expect(result).toEqual({
      kind: 'valid',
      secret: 'hello',
      legacy: false,
      suspects: [4],
      skipped: [],
    });
  });

  it('rejects shares relabelled with a lower threshold', async () => {
    const { encoded } = await split.execute({
      secret: 'hello',
      totalShares: 5,
      threshold: 3,
    });
    const { sha256 } = await import('@noble/hashes/sha2.js');
    const relabel = (share: string) => {
      const bytes = new Uint8Array(Base64.decodeToBuffer(share));
      bytes[2] = 2; // M: 3 -> 2
      bytes.set(
        sha256(bytes.subarray(0, bytes.length - 4)).subarray(0, 4),
        bytes.length - 4
      );
      return Base64.encodeBufferUrlSafe(bytes.buffer);
    };
    const result = await recover([relabel(encoded[0]), relabel(encoded[1])]);
    expect(result.kind).toBe('rejected');
  });

  it('refuses shares from different sets', async () => {
    const a = await split.execute({
      secret: 'a',
      totalShares: 3,
      threshold: 2,
    });
    const b = await split.execute({
      secret: 'b',
      totalShares: 3,
      threshold: 2,
    });
    await expect(recover([a.encoded[0], b.encoded[1]])).rejects.toThrow(
      /different set/
    );
  });

  it('still recovers when a damaged copy or a stray share is among enough good ones', async () => {
    const mine = await split.execute({
      secret: 'hello',
      totalShares: 5,
      threshold: 3,
    });
    const other = await split.execute({
      secret: 'other',
      totalShares: 5,
      threshold: 3,
    });
    const damaged = damageKeyPart(mine.encoded[3]);
    const result = await recover([
      other.encoded[0],
      mine.encoded[0],
      damaged,
      mine.encoded[1],
      mine.encoded[2],
    ]);
    expect(result).toMatchObject({
      kind: 'valid',
      secret: 'hello',
      skipped: [1, 3],
    });
  });

  it('reads shares typed from a printed card, in groups of four', async () => {
    const { encoded } = await split.execute({
      secret: 'hello',
      totalShares: 3,
      threshold: 2,
    });
    const typed = encoded.map((share) => share.match(/.{1,4}/g)!.join(' '));
    expect(await recover(typed.slice(0, 2))).toMatchObject({
      kind: 'valid',
      secret: 'hello',
    });
  });

  it('treats a share pasted twice as one share', async () => {
    const { encoded } = await split.execute({
      secret: 'hello',
      totalShares: 5,
      threshold: 3,
    });
    expect(
      await recover([encoded[0], encoded[0], encoded[1], encoded[2]])
    ).toMatchObject({ kind: 'valid', secret: 'hello' });
    expect((await recover([encoded[0], encoded[0], encoded[1]])).kind).toBe(
      'opaque'
    );
  });

  it('explains a share broken across lines and an oversized secret', async () => {
    const { encoded } = await split.execute({
      secret: 'hello',
      totalShares: 3,
      threshold: 2,
    });
    const broken = `${encoded[0].slice(0, 30)}\n${encoded[0].slice(30)}`;
    await expect(
      reconstruct.execute({ shareText: `${broken}\n${encoded[1]}` })
    ).rejects.toThrow(/join it into one line/);
    await expect(
      split.execute({
        secret: 'a'.repeat(17_000),
        totalShares: 3,
        threshold: 2,
      })
    ).rejects.toThrow(/limit is 16 KB/);
  });

  it('rejects empty input and a threshold above the share count', async () => {
    await expect(
      split.execute({ secret: ' ', totalShares: 3, threshold: 2 })
    ).rejects.toThrow();
    await expect(
      split.execute({ secret: 'x', totalShares: 2, threshold: 3 })
    ).rejects.toThrow();
    await expect(reconstruct.execute({ shareText: '\n \n' })).rejects.toThrow();
  });

  it('is deterministic with an injected random source', async () => {
    const run = async () =>
      (
        await new SplitSecretUseCase({
          random: createSequentialRandom([7, 3, 9, 1, 4]),
          aead: webCryptoAead,
        }).execute({ secret: 'abc', totalShares: 3, threshold: 2 })
      ).encoded;
    expect(await run()).toEqual(await run());
  });
});

describe('frozen v3 shares', () => {
  const { shares, threshold, secret } = SHAMIR_V3_VECTOR;

  it('any M of them open the secret, M-1 never do', async () => {
    const indices = [0, 1, 2, 3, 4];
    for (const a of indices)
      for (const b of indices)
        for (const c of indices) {
          if (!(a < b && b < c)) continue;
          expect(
            await recover([shares[a], shares[b], shares[c]])
          ).toMatchObject({ kind: 'valid', secret });
          expect((await recover([shares[a], shares[b]])).kind).toBe('opaque');
        }
    expect(threshold).toBe(3);
  });
});
