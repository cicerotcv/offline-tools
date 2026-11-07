import { describe, expect, it, vi } from 'vitest';

import { DecryptMessageUseCase } from './decrypt-message.use-case';
import { EncryptMessageUseCase } from './encrypt-message.use-case';

describe('message cipher use cases', () => {
  it('encrypt forwards data, password and filename to the port', async () => {
    const encrypt = vi.fn(async () => 'ARMORED');
    const result = await new EncryptMessageUseCase({ encrypt }).execute({
      data: 'hi',
      password: 'pw',
      filename: 'a.txt',
    });
    expect(result).toBe('ARMORED');
    expect(encrypt).toHaveBeenCalledWith('hi', 'pw', 'a.txt');
  });

  it('decrypt trims the armored input before calling the port', async () => {
    const decrypt = vi.fn(async () => ({ data: new Uint8Array([1]) }));
    await new DecryptMessageUseCase({ decrypt }).execute({
      armoredMessage: '  -----BEGIN PGP MESSAGE-----\n...\n ',
      password: 'pw',
    });
    expect(decrypt).toHaveBeenCalledWith(
      '-----BEGIN PGP MESSAGE-----\n...',
      'pw'
    );
  });

  it('rejects an empty password without calling the port', async () => {
    const encrypt = vi.fn();
    const decrypt = vi.fn();
    await expect(
      new EncryptMessageUseCase({ encrypt }).execute({
        data: 'x',
        password: '',
      })
    ).rejects.toThrow();
    await expect(
      new DecryptMessageUseCase({ decrypt }).execute({
        armoredMessage: 'x',
        password: '',
      })
    ).rejects.toThrow();
    expect(encrypt).not.toHaveBeenCalled();
    expect(decrypt).not.toHaveBeenCalled();
  });
});
