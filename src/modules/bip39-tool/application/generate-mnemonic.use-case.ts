import { UseCase } from '@/shared/application/use-case';
import type { DigestPort, RandomPort } from '@/shared/domain/crypto/port';

import type { WordCount } from '../domain/bitcoin/config';
import { generateMnemonicFromRandomWithExtraEntropy } from '../lib/mnemonic';
import { assertValidMnemonic } from './verify-mnemonic';

export interface GenerateMnemonicCommand {
  wordCount: WordCount;
  /** Optional user entropy; mixed with the CSPRNG through SHA-256, never instead of it. */
  extraEntropy?: Uint8Array;
}

export class GenerateMnemonicUseCase extends UseCase<
  GenerateMnemonicCommand,
  Promise<string>
> {
  constructor(
    private readonly randomSource: Pick<RandomPort, 'getRandomValues'>,
    private readonly digestPort: Pick<DigestPort, 'digest'>
  ) {
    super();
  }

  async execute({ wordCount, extraEntropy }: GenerateMnemonicCommand) {
    const mnemonic = await generateMnemonicFromRandomWithExtraEntropy(
      wordCount,
      extraEntropy,
      { random: this.randomSource, digest: this.digestPort }
    );
    assertValidMnemonic(mnemonic, wordCount);
    return mnemonic;
  }
}
