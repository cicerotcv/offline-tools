import { UseCase } from '@/shared/application/use-case';
import type { AeadPort, RandomPort } from '@/shared/domain/crypto/port';

import { SHAMIR_V2_VECTOR } from '../domain/vectors/v2-vectors';
import { SHAMIR_V3_VECTOR } from '../domain/vectors/v3-vectors';
import { ReconstructSecretUseCase } from './reconstruct-secret.use-case';
import { SplitSecretUseCase } from './split-secret.use-case';

const SELF_TEST_SECRET = 'offline-tools self-test';

/**
 * Round trip through split and reconstruct, then the frozen v2 and v3
 * shares: a round trip alone cannot notice a change in the field
 * arithmetic or the share layout that would strand stored shares.
 */
export class RunShamirSelfTestUseCase extends UseCase<void, Promise<void>> {
  constructor(
    private readonly deps: {
      random: Pick<RandomPort, 'getRandomValues'>;
      aead: Pick<AeadPort, 'seal' | 'open'>;
    }
  ) {
    super();
  }

  async execute(): Promise<void> {
    const reconstruct = new ReconstructSecretUseCase(this.deps.aead);
    const { encoded } = await new SplitSecretUseCase(this.deps).execute({
      secret: SELF_TEST_SECRET,
      totalShares: 5,
      threshold: 3,
    });
    await expectSecret(
      reconstruct,
      [encoded[4], encoded[1], encoded[3]],
      SELF_TEST_SECRET,
      'split and reconstruct'
    );

    for (const vector of [SHAMIR_V3_VECTOR, SHAMIR_V2_VECTOR]) {
      await expectSecret(
        reconstruct,
        [vector.shares[4], vector.shares[0], vector.shares[2]],
        vector.secret,
        'frozen shares'
      );
    }
  }
}

async function expectSecret(
  reconstruct: ReconstructSecretUseCase,
  lines: readonly string[],
  secret: string,
  label: string
) {
  const result = await reconstruct.execute({ shareText: lines.join('\n') });
  if (result.kind !== 'valid' || result.secret !== secret) {
    throw new Error(`Self-test failed: Shamir ${label}`);
  }
}
