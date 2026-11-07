import { UseCase } from '@/shared/application/use-case';
import type { DigestPort } from '@/shared/domain/crypto/port';

import type { WordCount } from '../domain/bitcoin/config';
import { generateMnemonicFromEntropy } from '../lib/mnemonic';
import { assertValidMnemonic } from './verify-mnemonic';

export interface MnemonicFromEntropyCommand {
  entropy: Uint8Array;
  wordCount: WordCount;
}

/** Deterministic mnemonic from user-supplied entropy (hashed if longer than needed). */
export class MnemonicFromEntropyUseCase extends UseCase<
  MnemonicFromEntropyCommand,
  Promise<string>
> {
  constructor(private readonly digestPort: Pick<DigestPort, 'digest'>) {
    super();
  }

  async execute({ entropy, wordCount }: MnemonicFromEntropyCommand) {
    const mnemonic = await generateMnemonicFromEntropy(
      entropy,
      wordCount,
      this.digestPort
    );
    assertValidMnemonic(mnemonic, wordCount);
    return mnemonic;
  }
}
