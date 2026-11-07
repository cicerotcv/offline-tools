import { UseCase } from '@/shared/application/use-case';
import type { DigestPort } from '@/shared/domain/crypto/port';

import type { Algorithm } from '../domain/hash/algorithm';
import { digestHex } from '../lib/digest';

export interface ComputeDigestCommand {
  data: Uint8Array;
  algorithm: Algorithm;
}

/** Hex digest of text, file or camera bytes. */
export class ComputeDigestUseCase extends UseCase<
  ComputeDigestCommand,
  Promise<string>
> {
  constructor(private readonly digestPort: Pick<DigestPort, 'digest'>) {
    super();
  }

  execute({ data, algorithm }: ComputeDigestCommand): Promise<string> {
    return digestHex(data, algorithm, this.digestPort);
  }
}
