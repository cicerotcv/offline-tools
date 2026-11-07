import * as bitcoin from 'bitcoinjs-lib';
import { describe, expect, it } from 'vitest';

import { BIP38_VECTORS } from '../../domain/vectors/official-vectors';
import {
  decryptPrivateKeyBIP38,
  encryptPrivateKeyBIP38,
  isValidBIP38,
} from './bip38-encryption';

// scrypt (N=16384, r=8, p=8) in pure JS is slow; one vector takes seconds.
const SCRYPT_TIMEOUT = 120_000;

describe('BIP38 official vectors (no EC multiply)', () => {
  it.each(BIP38_VECTORS.map((v) => [v.encrypted, v]))(
    '%s',
    async (_label, vector) => {
      expect(isValidBIP38(vector.encrypted)).toBe(true);

      const encrypted = await encryptPrivateKeyBIP38(
        vector.wif,
        vector.passphrase,
        bitcoin.networks.bitcoin
      );
      expect(encrypted).toBe(vector.encrypted);

      const wif = await decryptPrivateKeyBIP38(
        vector.encrypted,
        vector.passphrase,
        bitcoin.networks.bitcoin
      );
      expect(wif).toBe(vector.wif);
    },
    SCRYPT_TIMEOUT
  );

  it(
    'rejects a wrong passphrase',
    async () => {
      const [vector] = BIP38_VECTORS;
      await expect(
        decryptPrivateKeyBIP38(
          vector.encrypted,
          `${vector.passphrase}-wrong`,
          bitcoin.networks.bitcoin
        )
      ).rejects.toThrow();
    },
    SCRYPT_TIMEOUT
  );
});
