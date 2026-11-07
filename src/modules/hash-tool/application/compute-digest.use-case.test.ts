import { describe, expect, it, vi } from 'vitest';

import type { DigestPort } from '@/shared/domain/crypto/port';

import { ComputeDigestUseCase } from './compute-digest.use-case';

describe('ComputeDigestUseCase', () => {
  it('delegates SHA-2 to the injected digest port and returns hex', async () => {
    const digest = vi.fn<DigestPort['digest']>(
      async () => new Uint8Array([0xde, 0xad])
    );
    const useCase = new ComputeDigestUseCase({ digest });

    const hex = await useCase.execute({
      data: new Uint8Array([1]),
      algorithm: 'sha512',
    });

    expect(hex).toBe('dead');
    expect(digest).toHaveBeenCalledWith('SHA-512', new Uint8Array([1]));
  });

  it('computes MD5 without the port', async () => {
    const digest = vi.fn<DigestPort['digest']>();
    const hex = await new ComputeDigestUseCase({ digest }).execute({
      data: new TextEncoder().encode('abc'),
      algorithm: 'md5',
    });
    expect(hex).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(digest).not.toHaveBeenCalled();
  });
});
