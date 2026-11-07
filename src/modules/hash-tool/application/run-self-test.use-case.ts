import { UseCase } from '@/shared/application/use-case';
import type { DigestPort } from '@/shared/domain/crypto/port';

import { digestHex } from '../lib/digest';

const ABC = new TextEncoder().encode('abc');
const HIGH_BYTES = new Uint8Array([0xff, 0x00, 0x80]);

/** NIST "abc" vectors for SHA-2 and a non-ASCII MD5 vector. */
export class RunHashSelfTestUseCase extends UseCase<void, Promise<void>> {
  constructor(private readonly digestPort: Pick<DigestPort, 'digest'>) {
    super();
  }

  async execute(): Promise<void> {
    const expectations: [Uint8Array, 'sha256' | 'sha512' | 'md5', string][] = [
      [
        ABC,
        'sha256',
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      ],
      [
        ABC,
        'sha512',
        'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
      ],
      [HIGH_BYTES, 'md5', '60cdccd4000580a3c394b8ad6ea9b899'],
    ];
    for (const [data, algorithm, expected] of expectations) {
      if ((await digestHex(data, algorithm, this.digestPort)) !== expected) {
        throw new Error(`Self-test failed: ${algorithm}`);
      }
    }
  }
}
